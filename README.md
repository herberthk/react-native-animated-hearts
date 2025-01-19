# react-native-animated-hearts

Smooth animated heart reactions

## Installation

```sh
npm install react-native-animated-hearts
```

## Usage


```js
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

```


## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
