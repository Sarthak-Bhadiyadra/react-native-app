import { Link, useLocalSearchParams } from 'expo-router'
import { Text, View } from 'react-native'
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SubscriptionDetails = () => {

  const SafeAreaView = styled(RNSafeAreaView);
  const { id } = useLocalSearchParams()
  return (
    <SafeAreaView>
      <View>
        <Text>Subscription Details : {id}</Text>
        <Link href={'/'} className='mt-4 rounded bg-primary text-white p-4'>Go Back</Link>
      </View>
    </SafeAreaView>
  )
}

export default SubscriptionDetails