import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { generateNumericCode } from "../utils/codeGenerator";
import supabase from "../config/database";
import { config } from "../config/config";
import { AppError, createError } from "../utils/errorHandler";
import {
  User,
  CreateUserRequest,
  LoginRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SendVerificationEmailRequest,
  VerifyEmailRequest,
} from "../types";
import { logger } from "../utils/logger";
import {
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
} from "../services/emailService";

export class AuthController {
  // Register new user
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: CreateUserRequest = req.body;
      const { email, password, verificationCode } = userData;
      logger.info("Register - Received data:", { email, verificationCode });

      if (!verificationCode) {
        throw createError("Verification code is required", 400);
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (existingUser) {
        throw createError("User with this email already exists", 400);
      }

      // Validate verification code
      const { data: tokenData, error: tokenError } = await supabase
        .from("email_verification_tokens")
        .select("*")
        .eq("email", email)
        .eq("token", verificationCode)
        .eq("used", false)
        .gte("expires_at", new Date().toISOString())
        .limit(1);

      if (tokenError || !tokenData) {
        logger.error(
          "Register - Token validation failed:",
          tokenError || "No token data found"
        );
        throw createError("Invalid or expired verification code", 400);
      }
      logger.info("Register - Token data found:", tokenData);

      // Mark token as used
      await supabase
        .from("email_verification_tokens")
        .update({ used: true })
        .eq("id", tokenData[0].id); // Fixed access

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      logger.info(
        `AuthController: Hashed password for registration (first 10 chars): ${hashedPassword.substring(
          0,
          10
        )}`
      );

      // Create user
      const userId = uuidv4();
      const newUser: Partial<User> = {
        id: userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        active_role: userData.role === "musician" ? "musician" : "leader",
        status: userData.role === "leader" ? "active" : "pending",
        church_name: userData.church_name || "",
        location: userData.location || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: user, error: userError } = await supabase
        .from("users")
        .insert([newUser])
        .select()
        .single();

      if (userError) {
        logger.error("Error creating user:", userError);
        throw createError("Failed to create user", 500);
      }

      // Store hashed password separately (in a passwords table)

      const { error: passwordError } = await supabase
        .from("user_passwords")
        .insert([
          {
            user_id: userId,
            password: hashedPassword,
            created_at: new Date().toISOString(),
          },
        ]);

      if (passwordError) {
        logger.error("Error storing password:", passwordError);
        throw createError("Failed to store password", 500);
      }

      // Add instruments if user is a musician
      if (userData.role === "musician" && userData.instruments) {
        const instrumentsData = userData.instruments.map((instrument) => ({
          id: uuidv4(),
          user_id: userId,
          instrument: instrument.instrument,
          years_experience: instrument.years_experience,
          created_at: new Date().toISOString(),
        }));

        const { error: instrumentsError } = await supabase
          .from("user_instruments")
          .insert(instrumentsData);

        if (instrumentsError) {
          logger.error("Failed to add instruments:", instrumentsError);
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: "24h" }
      );

      const response: AuthResponse = {
        success: true,
        message: "User registered successfully and email verified.",
        user: user as User,
        token,
      };

      res.status(201).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        logger.error("Registration error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  };

  public sendRegistrationVerificationCode = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { email } = req.body;
    logger.info("SendCode - Received request for email:", email);
    try {
      // Generate new verification token
      const verificationToken = generateNumericCode(6);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

      // Invalidate previous tokens for this email
      logger.info("SendCode - Invalidating previous tokens for email:", email);
      await supabase
        .from("email_verification_tokens")
        .update({ used: true })
        .eq("email", email)
        .eq("used", false);
      logger.info("SendCode - Previous tokens invalidated.");

      // Save new verification token to database
      logger.info("SendCode - Saving new token:", {
        email,
        verificationToken,
        expiresAt: expiresAt.toISOString(),
      });
      const { error: tokenError } = await supabase
        .from("email_verification_tokens")
        .insert([
          {
            email: email,
            token: verificationToken,
            expires_at: expiresAt.toISOString(),
            used: false,
          },
        ]);

      // Send verification email
      try {
        await sendEmailVerificationEmail(email, "Usuario", verificationToken);
      } catch (emailError) {
        logger.error(
          "SendCode - Error sending verification email:",
          emailError
        );
        throw createError("Failed to send verification email", 500);
      }

      if (tokenError) {
        logger.error(
          "SendCode - Error creating new verification token:",
          tokenError
        );
        throw createError("Failed to generate new verification code", 500);
      }
      logger.info("SendCode - New token saved successfully.");

      res.status(200).json({
        success: true,
        message: "Verification email sent successfully.",
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        logger.error("SendCode - Error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  };

  // Login user
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password }: LoginRequest = req.body;
      logger.info(`1. AuthController: Attempting login for email: ${email}`);
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, name, email, phone, status, active_role, role")
        .eq("email", email)
        .single();
      logger.debug(`1. AuthController: Raw user data from DB: ${JSON.stringify(user)}`);
      if (userError || !user) {
        logger.warn(
          `AuthController: User not found or error fetching user for email: ${email}, Error: ${userError?.message}`
        );
        throw createError("Invalid email or password", 401);
      }

      logger.debug(`2. AuthController: User found: ${JSON.stringify(user)}`);

      const { data: passwordData, error: passwordError } = await supabase
        .from("user_passwords")
        .select("password")
        .eq("user_id", user.id)
        .single();
        logger.debug(`1. AuthController: Raw password data from DB: ${JSON.stringify(passwordData)}`);
        logger.debug(`2. AuthController: Raw password error from DB: ${JSON.stringify(passwordError)}`);

      if (passwordError || !passwordData) {
        logger.warn(
          `1. AuthController: Password not found for user ID: ${user.id}, Error: ${passwordError?.message}`
        );
        logger.debug(`AuthController: Full password error object: ${JSON.stringify(passwordError)}`);
        throw createError("Invalid email or password", 401);
      }

      logger.debug(
        `AuthController: Password data retrieved: ${JSON.stringify(
          passwordData
        )}`
      );
      logger.debug(
        `AuthController: Hashed password from DB: ${passwordData.password}`
      );
      logger.debug(
        `AuthController: Password provided by user (first 5 chars): ${password.substring(
          0,
          5
        )}`
      );

      const isPasswordValid = await bcrypt.compare(
        password,
        passwordData.password
      );

      logger.debug(
        `AuthController: Password comparison result: ${isPasswordValid}`
      );

      if (!isPasswordValid) {
        logger.warn(`AuthController: Invalid password for user ID: ${user.id}`);
        throw createError("Invalid email or password", 401);
      }

      // Check if user is active
      if (user.status === "rejected") {
        throw createError(
          "Account is not active. Please wait for approval.",
          403
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: "24h" }
      );

      const response: AuthResponse = {
        success: true,
        message: "Login successful",
        user: user as User,
        token,
      };

      res.status(200).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        logger.error("Login error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  };

  // Logout user
  public logout = async (_req: Request, res: Response): Promise<void> => {
    try {
      // In a real app, you might want to blacklist the token
      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      logger.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  // Forgot password - Send reset email
  public async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email }: ForgotPasswordRequest = req.body;
      logger.info(
        "AuthController: Received forgot password request for",
        email
      );

      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, name, email, status")
        .eq("email", email.toLowerCase())
        .single();

      logger.info("AuthController: User data after query:", user);
      if (userError || !user) {
        // Don't reveal if user exists or not for security
        res.status(200).json({
          success: true,
          message:
            "Si el email existe en nuestro sistema, recibirás un código para restablecer tu contraseña.",
        });
        return;
      }

      // Check if user is active
      if (user.status !== "active") {
        res.status(200).json({
          success: true,
          message:
            "Si el email existe en nuestro sistema, recibirás un código para restablecer tu contraseña.",
        });
        return;
      }

      // Generate new numeric reset code
      const resetCode = generateNumericCode(6);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

      // Invalidate previous tokens for this user
      logger.info(
        "AuthController: Invalidating previous password reset tokens for user:",
        user.id
      );
      await supabase
        .from("password_reset_tokens")
        .update({ used: true, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("used", false);
      logger.info(
        "AuthController: Previous password reset tokens invalidated."
      );

      // Save new reset token to database
      logger.info("AuthController: Saving new password reset token:", {
        user_id: user.id,
        resetCode,
        expiresAt: expiresAt.toISOString(),
      });
      const { error: tokenError } = await supabase
        .from("password_reset_tokens")
        .insert([
          {
            user_id: user.id,
            token: resetCode,
            expires_at: expiresAt.toISOString(),
            used: false,
          },
        ]);

      if (tokenError) {
        logger.error(
          "AuthController: Error creating new password reset token:",
          tokenError
        );
        throw createError("Failed to generate new password reset code", 500);
      }

      logger.info(
        `AuthController: Saved password reset token for user ${
          user.id
        }: code=${resetCode}, expires_at=${expiresAt.toISOString()}, used=false`
      );

      // Send reset email with code
      logger.info(
        "AuthController: Attempting to send password reset email to",
        user.email
      );
      try {
        logger.info(
          "AuthController: Before calling sendPasswordResetEmail for",
          user.email
        );
        await sendPasswordResetEmail(user.email, user.name, resetCode);
        logger.info(
          "AuthController: After calling sendPasswordResetEmail for",
          user.email
        );
      } catch (emailError) {
        logger.error("AuthController: Failed to send reset email:", emailError);
        // Don't fail the request if email fails
        logger.error(
          "AuthController: Email sending failed, but request will proceed."
        );
      }

      res.status(200).json({
        success: true,
        message:
          "Si el email existe en nuestro sistema, recibirás un código para restablecer tu contraseña.",
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        logger.error("Forgot password error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  }

  // Reset password - Validate code and set new password
  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info("Reset password request received 123");
      logger.info("AuthController: resetPassword - Request body:", req.body);
      const { code, email, new_password }: ResetPasswordRequest = req.body;
      logger.info(
        `AuthController: resetPassword - Received code: ${code}, email: ${email}, new_password: ${
          new_password ? "***" : "undefined"
        }`
      );

      if (!code || !email || !new_password) {
        throw createError(
          "Verification code, email and new password are required",
          400
        );
      }

      // Get user_id from email
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email.toLowerCase())
        .single();

      if (userError || !user) {
        throw createError("Invalid email", 400);
      }

      // Validate password strength
      if (new_password.length < 8) {
        throw createError(
          "La contraseña debe tener al menos 8 caracteres",
          400
        );
      }

      // Find valid reset token
      const { data: resetToken, error: tokenError } = await supabase
        .from("password_reset_tokens")
        .select("id, token, expires_at, used, user_id")
        .eq("token", code)
        .eq("user_id", user.id) // Changed from email to user_id
        .eq("used", false)
        .single();

      // Add this for debugging
      const { data: allTokensForUserCode, error: allTokensError } =
        await supabase
          .from("password_reset_tokens")
          .select("id, token, expires_at, used, user_id")
          .eq("token", code)
          .eq("user_id", user.id);

      logger.info(
        "AuthController: resetPassword - All tokens for user and code (ignoring used status):",
        allTokensForUserCode
      );
      logger.info(
        "AuthController: resetPassword - All tokens error:",
        allTokensError
      );

      if (resetToken && new Date().toISOString() > resetToken.expires_at) {
        logger.error(
          "AuthController: resetPassword - Token has expired based on manual check."
        );
        throw createError("Código inválido o expirado", 400);
      }

      logger.info(
        `AuthController: resetPassword - Querying for token: ${code}, user_id: ${
          user.id
        }, used: false, expires_at >= ${new Date().toISOString()}`
      );
      logger.info(
        "AuthController: resetPassword - Query result for token:",
        resetToken,
        "Error:",
        tokenError
      );
      logger.info(
        "AuthController: resetPassword - Current time for expiration check:",
        new Date().toISOString()
      );

      if (resetToken) {
        logger.info(
          `AuthController: resetPassword - Found token in DB: ${resetToken.token}, expires_at: ${resetToken.expires_at}, used: ${resetToken.used}`
        );
        logger.info(
          `AuthController: resetPassword - Token expires_at: ${
            resetToken.expires_at
          }, Current time: ${new Date().toISOString()}, Token used: ${
            resetToken.used
          }`
        );
      }

      if (tokenError || !resetToken) {
        logger.error(
          "AuthController: resetPassword - Token not found or invalid. tokenError:",
          tokenError,
          "resetToken:",
          resetToken
        );
        logger.error(
          `AuthController: Código recibido en la solicitud: ${code}`
        );

        throw createError("Código inválido o expirado", 400);
      }
      logger.info(
        "AuthController: resetPassword - Reset token found:",
        resetToken
      );
      logger.info(`AuthController: Código recibido en la solicitud: ${code}`);
      logger.info(
        `AuthController: Fecha de expiración del token: ${resetToken.expires_at}`
      );
      logger.info(`AuthController: Fecha actual: ${new Date().toISOString()}`);

      // Hash new password
      const hashedPassword = await bcrypt.hash(new_password, 12);

      // Update password in database
      const { error: passwordError } = await supabase
        .from("user_passwords")
        .update({ password: hashedPassword })
        .eq("user_id", resetToken.user_id);

      if (passwordError) {
        logger.error("Error updating password:", passwordError);
        throw createError("Failed to update password", 500);
      }

      // Mark the reset token as used
      const { error: updateTokenError } = await supabase
        .from("password_reset_tokens")
        .update({ used: true })
        .eq("id", resetToken.id);

      if (updateTokenError) {
        logger.error("Error marking token as used:", updateTokenError);
        // Decide if this should be a critical error or just log it
        // For now, we'll log it and proceed, as password was already updated
      }

      res.status(200).json({
        success: true,
        message:
          "Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.",
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        logger.error("Reset password error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  };

  // Validate reset code
  public validateResetCode = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { code, email } = req.body;

      if (!code || !email) {
        throw createError("Verification code and email are required", 400);
      }

      // Get user_id from email
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (userError || !user) {
        throw createError("Invalid email", 400);
      }

      // Find valid reset token
      const { data: resetToken, error: tokenError } = await supabase
        .from("password_reset_tokens")
        .select("id, expires_at, used, user_id")
        .eq("token", code)
        .eq("user_id", user.id)
        .eq("used", false)
        .gte("expires_at", new Date().toISOString())
        .single();

      if (tokenError || !resetToken) {
        console.log("123.Reset token:", resetToken);
        console.log("123.Token error:", tokenError);
        throw createError("Código inválido o expirado", 400);
      }

      res.status(200).json({
        success: true,
        message: "Código de verificación válido",
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        logger.error("Validate reset code error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  };

  // Send verification email
  public sendVerificationEmail = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { email }: SendVerificationEmailRequest = req.body;

      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, name, email, status")
        .eq("email", email)
        .single();

      if (userError || !user) {
        // Don't reveal if user exists or not for security
        res.status(200).json({
          success: true,
          message:
            "Si el email existe en nuestro sistema, recibirás un código de verificación.",
        });
        return;
      }

      // Check if user is already verified (you might want to add an email_verified field)
      // For now, we'll just send the email regardless

      // Generate verification code using database function
      const { data: verificationCode, error: codeError } = await supabase.rpc(
        "create_email_verification_code",
        { p_user_id: user.id }
      );

      if (codeError) {
        logger.error("Error generating verification code:", codeError);
        throw createError("Failed to create verification code", 500);
      }

      // Send verification email
      try {
        await sendEmailVerificationEmail(
          user.email,
          user.name,
          verificationCode
        );
      } catch (emailError) {
        logger.error("Failed to send verification email:", emailError);
        // Don't fail the request if email fails
      }

      res.status(200).json({
        success: true,
        message:
          "Si el email existe en nuestro sistema, recibirás un código de verificación.",
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        logger.error("Send verification email error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  };

  // Verify email with code
  public verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, email }: VerifyEmailRequest = req.body;

      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, name, email, status")
        .eq("email", email)
        .single();

      if (userError || !user) {
        throw createError("Usuario no encontrado", 404);
      }

      // Verify code using database function
      const { data: isValid, error: verifyError } = await supabase.rpc(
        "verify_email_code",
        {
          p_user_id: user.id,
          p_code: code,
        }
      );

      if (verifyError) {
        logger.error("Error verifying code:", verifyError);
        throw createError("Error al verificar el código", 500);
      }

      if (!isValid) {
        // Check if code is locked
        const { data: tokenData } = await supabase
          .from("email_verification_tokens")
          .select("attempts, max_attempts, locked_until")
          .eq("email", email)
          .eq("token", code)
          .single();

        if (
          tokenData &&
          tokenData.locked_until &&
          new Date(tokenData.locked_until) > new Date()
        ) {
          const lockTime = new Date(tokenData.locked_until);
          throw createError(
            `Código bloqueado. Intenta nuevamente después de ${lockTime.toLocaleString()}`,
            429
          );
        }

        if (tokenData && tokenData.attempts >= tokenData.max_attempts) {
          throw createError(
            "Código bloqueado por demasiados intentos fallidos",
            429
          );
        }

        throw createError("Código de verificación inválido o expirado", 400);
      }

      // Update user status to active (if they were pending)
      const { error: updateUserError } = await supabase
        .from("users")
        .update({
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateUserError) {
        logger.error("Error updating user status:", updateUserError);
        // Don't fail the request if user update fails
      }

      res.status(200).json({
        success: true,
        message: "Email verificado exitosamente. Tu cuenta ha sido activada.",
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        logger.error("Verify email error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  };

  // Validate verification token
  public validateVerificationToken = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { token } = req.params;

      // Find valid verification token
      const { data: verificationToken, error: tokenError } = await supabase
        .from("email_verification_tokens")
        .select("id, expires_at, used")
        .eq("token", token)
        .eq("used", false)
        .gt("expires_at", new Date().toISOString())
        .single();
      if (tokenError || !verificationToken) {
        res.status(400).json({
          success: false,
          message: "Token de verificación inválido o expirado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Token de verificación válido",
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        logger.error("Validate verification token error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  };
}
