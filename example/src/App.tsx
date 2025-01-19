import { useRef } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import HeartAnimation, {
  type HeartAnimationRef,
} from 'react-native-animated-hearts';

export default function App() {
  const heartAnimationRef = useRef<HeartAnimationRef>(null);

  // Trigger the heart animation
  const handleButtonPress = () => {
    heartAnimationRef.current?.triggerAnimation();
  };

  return (
    <View style={styles.container}>
      <HeartAnimation ref={heartAnimationRef} />
      {/* Button to trigger animation */}
      <Button title="Trigger Heart Animation" onPress={handleButtonPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#fff',
  },
});
