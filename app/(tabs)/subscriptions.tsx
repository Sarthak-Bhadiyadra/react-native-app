import { Text, View } from 'react-native'
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  return (
    <SafeAreaView>
      <View>
        <Text>Subscriptions</Text>
      </View>
    </SafeAreaView>
  )
}

export default Subscriptions