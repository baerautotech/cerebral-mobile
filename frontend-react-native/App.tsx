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

// TODO: Set your RevenueCat API key here
const REVENUECAT_API_KEY = 'your_revenuecat_api_key_here';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <FeatureFlagProvider>
      <TierProvider>
        <IAPProvider apiKey={REVENUECAT_API_KEY}>
          <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
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
