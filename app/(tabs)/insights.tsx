import { Text, View } from 'react-native'
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
  return (
    <SafeAreaView>
    <View>
      <Text>Insights</Text>
    </View>
    </SafeAreaView>
  )
}

export default Insights