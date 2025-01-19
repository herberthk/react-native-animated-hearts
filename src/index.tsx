import React, {
  useCallback,
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
} from 'react';
import { Dimensions, Image, Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

// Get device dimensions
const { width, height } = Dimensions.get('window');

// Types for individual hearts and callbacks
type Heart = {
  id: number; // Unique identifier for the heart
  size: number; // Size of the heart (in pixels)
  x: number; // X-coordinate of the heart's initial position
  y: number; // Y-coordinate of the heart's initial position
};

type AnimatedHeartProps = {
  heart: Heart; // Details about the animated heart
  onEnd: (id: number) => void; // Callback triggered when the animation ends
};

type HeartAnimationProps = {};

export type HeartAnimationRef = {
  /**
   * This method triggers the heart animations
   */
  triggerAnimation: () => void;
};

// Main HeartAnimation component
const HeartAnimation = forwardRef<HeartAnimationRef, HeartAnimationProps>(
  (_, ref) => {
    const [hearts, setHearts] = useState<Heart[]>([]); // State to track active hearts
    const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null); // To debounce tap gestures

    // Handle tap gesture with debouncing
    const handleTap = () => {
      // Clear any previous debounce timeout
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      // Set a new debounce timeout
      debounceTimeout.current = setTimeout(() => {
        const count = Math.floor(Math.random() * (30 - 4 + 1)) + 4; // Random count between 4 and 30
        const newHearts: Heart[] = Array.from({ length: count }, () => ({
          id: Date.now() + Math.random(), // Unique ID for each heart
          size: Math.floor(Math.random() * (60 - 20 + 1)) + 20, // Random size between 20 and 60 pixels
          x: Math.random() * width * 0.8 + width * 0.1, // Random X position within screen bounds
          y: Math.random() * height * 0.5 + height * 0.2, // Random Y position within screen bounds
        }));

        // Add new hearts to the state
        setHearts((prev) => [...prev, ...newHearts]);
      }, 300); // 300ms debounce delay
    };

    // Remove a heart after its animation ends
    const removeHeart = useCallback((id: number) => {
      setHearts((prev) => prev.filter((heart) => heart.id !== id));
    }, []);

    // Expose the `triggerAnimation` method to parent components
    useImperativeHandle(ref, () => ({
      triggerAnimation: handleTap,
    }));

    return (
      <Pressable onPress={handleTap}>
        <View>
          {/* Render animated hearts */}
          {hearts.map((heart, i) => (
            <AnimatedHeart
              key={`${heart.id}-${i}`}
              heart={heart}
              onEnd={removeHeart}
            />
          ))}
        </View>
      </Pressable>
    );
  }
);

// AnimatedHeart component handles individual heart animations
const AnimatedHeart: React.FC<AnimatedHeartProps> = ({ heart, onEnd }) => {
  const { id, size, x, y } = heart;

  // Shared animation values
  const opacity = useSharedValue(0); // Initial opacity (fade-in and fade-out)
  const translateY = useSharedValue(0); // Initial vertical translation

  // Animated styles for the heart
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value, // Bind opacity value
    transform: [{ translateY: translateY.value }], // Bind vertical translation
    position: 'absolute', // Absolute positioning
    left: x, // Initial X position
    top: y, // Initial Y position
  }));

  // Handle animation lifecycle
  React.useEffect(() => {
    // Fade-in animation
    opacity.value = withTiming(
      1,
      { duration: 300, easing: Easing.out(Easing.ease) },
      () => {
        // Fade-out animation after fade-in completes
        opacity.value = withTiming(
          0,
          { duration: 1000, easing: Easing.linear },
          () => {
            // Run callback to remove the heart after animation ends
            runOnJS(onEnd)(id);
          }
        );
      }
    );

    // Translate the heart upwards during the animation
    translateY.value = withTiming(-100, {
      duration: 1000,
      easing: Easing.out(Easing.ease),
    });
  }, [id, onEnd, opacity, translateY]);

  return (
    <Animated.View style={[animatedStyle, { width: size, height: size }]}>
      {/* Render the heart icon */}
      <Image
        style={{ height: size, width: size }}
        source={require('./heart.png')}
      />
    </Animated.View>
  );
};

export default HeartAnimation;
