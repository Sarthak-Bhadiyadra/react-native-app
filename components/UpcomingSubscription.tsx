import { View, Text, Image } from 'react-native'
import React from 'react'
import { formatCurrency } from '@/lib/utils'

const UpcomingSubscription = ({data}: UpcomingSubscription) => {
  const {name, price, dayLeft, icon} = data
  return (
    <View className='upcoming-card'>
        <View className='upcoming-row'>
            <Image source={icon} className='upcoming-icon'/>
            <View >
                <Text className='upcoming-price'>{formatCurrency(price)}</Text>
                <Text className='upcoming-meta' numberOfLines={1}>{dayLeft > 1 ? `${dayLeft} days left` : "last day"}</Text>
            </View>
        </View>
                <Text className='upcoming-name'>{name}</Text>
    </View>
  )
}

export default UpcomingSubscription