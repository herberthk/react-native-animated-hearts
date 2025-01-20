import React, {
  useCallback,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { Dimensions, Image, Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import throttle from 'lodash/throttle';

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

type HeartAnimationProps = {
  /**
   * Maximum number of reactions to be generated
   */
  maxItems?: number;
  /**
   * Minimum number of reactions to be generated
   */
  miniItems?: number;
};

export type HeartAnimationRef = {
  /**
   * This method triggers the heart animations
   */
  triggerAnimation: () => void;
};

// Main HeartAnimation component
const HeartAnimation = forwardRef<HeartAnimationRef, HeartAnimationProps>(
  ({ maxItems = 10, miniItems = 4 }, ref) => {
    const [hearts, setHearts] = useState<Heart[]>([]); // State to track active hearts

    // Throttling to ensure handleTap is triggered only once every 300ms.
    const handleTap = throttle(() => {
      const count =
        Math.floor(Math.random() * (maxItems - miniItems + 1)) + miniItems; // Random count
      const newHearts: Heart[] = Array.from({ length: count }, () => ({
        id: Date.now() + Math.random(), // Unique ID for each heart
        size: Math.floor(Math.random() * (60 - 20 + 1)) + 20, // Random size between 20 and 60 pixels
        x: Math.random() * width * 0.8 + width * 0.1, // Random X position
        y: Math.random() * height * 0.5 + height * 0.2, // Random Y position
      }));

      // Batch updates to limit rendering
      setHearts((prev) => {
        const maxRenderedHearts = 30; // Limit the number of hearts rendered
        const updatedHearts = [...prev, ...newHearts];
        return updatedHearts.length > maxRenderedHearts
          ? updatedHearts.slice(-maxRenderedHearts) // Keep the most recent hearts
          : updatedHearts;
      });
    }, 300); // Throttle

    // Remove a heart after its animation ends
    const removeHeart = useCallback((id: number) => {
      // Lazy Removal for Delayed state updates for heart removal using setTimeout
      setTimeout(() => {
        setHearts((prev) => prev.filter((heart) => heart.id !== id));
      }, 1100); // Match animation duration (1000ms + buffer)
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
    zIndex: 10000,
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
