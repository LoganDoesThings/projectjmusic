import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Music, Folder, Heart } from 'lucide-react-native';
import { LibraryScreen } from '../screens/LibraryScreen';
import { FoldersScreen } from '../screens/FoldersScreen';
import { FolderDetailScreen } from '../screens/FolderDetailScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { getColors } from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const FolderStack = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FoldersList">
        {(props) => <FoldersScreen {...props} isDarkMode={isDarkMode} />}
      </Stack.Screen>
      <Stack.Screen name="FolderDetail">
        {(props) => <FolderDetailScreen {...props} isDarkMode={isDarkMode} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export const AppNavigator = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const colors = getColors(isDarkMode);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Library') return <Music color={color} size={size} />;
          if (route.name === 'Folders') return <Folder color={color} size={size} />;
          if (route.name === 'Favorites') return <Heart color={color} size={size} />;
          return null;
        },
      })}
    >
      <Tab.Screen name="Library">
        {() => <LibraryScreen isDarkMode={isDarkMode} />}
      </Tab.Screen>
      <Tab.Screen name="Folders">
        {() => <FolderStack isDarkMode={isDarkMode} />}
      </Tab.Screen>
      <Tab.Screen name="Favorites">
        {() => <FavoritesScreen isDarkMode={isDarkMode} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};
