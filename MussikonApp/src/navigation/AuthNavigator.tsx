import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SimpleWelcomeScreen, LoginScreen, RegisterScreen, AboutScreen } from '../screens';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import SendVerificationEmailScreen from '../screens/SendVerificationEmailScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';

const Stack = createStackNavigator();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator {...({ id: "AuthNavigator" } as any)} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={SimpleWelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="SendVerificationEmail" component={SendVerificationEmailScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
