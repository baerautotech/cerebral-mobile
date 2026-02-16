import { env } from './src/config/env';
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';

import StepUpRequiredModal from './src/components/StepUpRequiredModal';
import RootNavigator from './src/navigation/RootNavigator';
import { FeatureFlagProvider } from './src/providers/FeatureFlagProvider';
import { IAPProvider } from './src/providers/IAPProvider';
import { TierProvider } from './src/providers/TierProvider';

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
            <RootNavigator />
            <StepUpRequiredModal />
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
