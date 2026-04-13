import { AuthProvider } from '@/contexts/AuthContext';
import { type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WebOnlyColorSchemeUpdater } from './ColorSchemeUpdater';
import { HeroUINativeProvider } from '@/heroui';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Toast from 'react-native-toast-message';

function Provider({ children }: { children: ReactNode }) {
  return <WebOnlyColorSchemeUpdater>
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <HeroUINativeProvider>
          <ThemeProvider>
            {children}
            <Toast />
          </ThemeProvider>
        </HeroUINativeProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  </WebOnlyColorSchemeUpdater>
}

export {
  Provider,
}
