import { env } from './src/config/env';
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { FeatureFlagProvider } from './src/providers/FeatureFlagProvider';
import { TierProvider } from './src/providers/TierProvider';
import { IAPProvider } from './src/providers/IAPProvider';

// RevenueCat SDK key (configured via env; do not hardcode)
const REVENUECAT_API_KEY = env.PUBLIC_API_KEY ?? '';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <FeatureFlagProvider>
      <TierProvider>
        <IAPProvider apiKey={REVENUECAT_API_KEY}>
          <View style={styles.container}>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            />
            <NewAppScreen templateFileName="App.tsx" />
          </View>
        </IAPProvider>
      </TierProvider>
    </FeatureFlagProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
