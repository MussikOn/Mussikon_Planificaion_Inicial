import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SimpleWelcomeScreen, LoginScreen, RegisterScreen, AboutScreen } from '../screens';

const Stack = createStackNavigator();

const AuthNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState('Welcome');

  const handleGetStarted = () => {
    setCurrentScreen('Register');
  };

  const handleLogin = () => {
    setCurrentScreen('Login');
  };

  const handleAbout = () => {
    setCurrentScreen('About');
  };

  const handleBack = () => {
    setCurrentScreen('Welcome');
  };

  const handleRegister = () => {
    setCurrentScreen('Login');
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {currentScreen === 'Welcome' && (
        <Stack.Screen name="Welcome">
          {() => (
            <SimpleWelcomeScreen
              onGetStarted={handleGetStarted}
              onLogin={handleLogin}
              onAbout={handleAbout}
            />
          )}
        </Stack.Screen>
      )}
      {currentScreen === 'Login' && (
        <Stack.Screen name="Login">
          {() => (
            <LoginScreen
              onBack={handleBack}
              onRegister={handleRegister}
            />
          )}
        </Stack.Screen>
      )}
      {currentScreen === 'Register' && (
        <Stack.Screen name="Register">
          {() => (
            <RegisterScreen
              onBack={handleBack}
              onLogin={handleLogin}
            />
          )}
        </Stack.Screen>
      )}
      {currentScreen === 'About' && (
        <Stack.Screen name="About">
          {() => (
            <AboutScreen
              onBack={handleBack}
            />
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
};

export default AuthNavigator;
