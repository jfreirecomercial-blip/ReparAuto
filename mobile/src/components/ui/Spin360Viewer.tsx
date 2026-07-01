import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { SPIN_ANGLE_LABELS, spinFrameFromDrag, type SpinAngle } from '@/lib/spin360';

interface Spin360ViewerProps {
  visible: boolean;
  onClose: () => void;
  /** Ordered rotation frames (from getSpinFrames). */
  frames: string[];
  /** Angle of each frame (from getSpinAngles), used for the on-screen label. */
  angles: SpinAngle[];
}

/**
 * Fullscreen drag-to-rotate viewer: a horizontal pan scrubs through the
 * tagged angle photos in circular order (mirror of the web Spin360Viewer).
 */
export function Spin360Viewer({ visible, onClose, frames, angles }: Spin360ViewerProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [frame, setFrame] = useState(0);
  const [interacted, setInteracted] = useState(false);
  // Refs so the gesture callbacks never read a stale frame mid-drag.
  const frameRef = useRef(0);
  const startFrameRef = useRef(0);

  useEffect(() => {
    if (visible) {
      frameRef.current = 0;
      setFrame(0);
      setInteracted(false);
    }
  }, [visible]);

  if (!visible || frames.length === 0) return null;

  const showFrame = (f: number) => {
    frameRef.current = f;
    setFrame(f);
  };

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onStart(() => {
      startFrameRef.current = frameRef.current;
      setInteracted(true);
    })
    .onUpdate((e) => {
      showFrame(spinFrameFromDrag(startFrameRef.current, e.translationX, frames.length));
    });

  return (
    <Modal visible animationType="fade" onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 bg-black">
          {/* Top bar */}
          <View style={{ marginTop: insets.top + 8 }} className="flex-row items-center justify-between px-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="sync-outline" size={18} color="#fff" />
              <Text className="text-sm font-bold text-white">Vista 360°</Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Fechar vista 360"
              className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
            >
              <Ionicons name="close" size={22} color="#fff" />
            </Pressable>
          </View>

          {/* Stage */}
          <GestureDetector gesture={pan}>
            <View className="flex-1 items-center justify-center">
              {/* All frames stay mounted (pre-decoded) so scrubbing never flickers. */}
              {frames.map((src, i) => (
                <Image
                  key={src}
                  source={src}
                  style={{
                    position: 'absolute',
                    width,
                    height: width * 0.75,
                    opacity: i === frame ? 1 : 0,
                  }}
                  contentFit="contain"
                  accessibilityLabel={`Veículo — ${SPIN_ANGLE_LABELS[angles[i]] ?? `ângulo ${i + 1}`}`}
                />
              ))}

              {/* Current angle */}
              <View className="absolute top-3 rounded-full bg-white/10 px-3 py-1">
                <Text accessibilityLiveRegion="polite" className="text-xs font-bold text-white">
                  {SPIN_ANGLE_LABELS[angles[frame]] ?? ''}
                </Text>
              </View>

              {/* Drag hint (until first interaction) */}
              {!interacted && (
                <View className="absolute bottom-8 flex-row items-center gap-1.5">
                  <Ionicons name="sync-outline" size={14} color="rgba(255,255,255,0.7)" />
                  <Text className="text-[11px] text-white/70">
                    Arraste para os lados para rodar o veículo
                  </Text>
                </View>
              )}
            </View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
