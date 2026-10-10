import { Text, View } from 'react-native'

import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  return (
    <SafeAreaView>
    <View>
      <Text>Settings</Text>
    </View>
    </SafeAreaView>
  )
}

export default Settings