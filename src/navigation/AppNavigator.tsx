import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Music, Folder, Heart } from 'lucide-react-native';

import { LibraryScreen } from '../screens/LibraryScreen';
import { FoldersScreen } from '../screens/FoldersScreen';
import { FolderDetailScreen } from '../screens/FolderDetailScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { getColors } from '../theme/colors';

// ============================================================================
// Navigator Setup
// ============================================================================
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ============================================================================
// Folder Stack Navigator
// ============================================================================
// This stack handles navigation between the Folder List and Folder Details.
const FolderStack = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* List of all folders */}
      <Stack.Screen name="FoldersList">
        {(props) => <FoldersScreen {...props} isDarkMode={isDarkMode} />}
      </Stack.Screen>
      
      {/* Individual folder view */}
      <Stack.Screen name="FolderDetail">
        {(props) => <FolderDetailScreen {...props} isDarkMode={isDarkMode} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

// ============================================================================
// Main Tab Navigator
// ============================================================================
// The bottom navigation bar structure.
export const AppNavigator = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const colors = getColors(isDarkMode);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        // Style the bottom bar
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 0, // Remove Android shadow
          shadowOpacity: 0 // Remove iOS shadow
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        // Dynamic icons based on route name
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Library') {
              return <Music color={color} size={size} />;
          }
          if (route.name === 'Folders') {
              return <Folder color={color} size={size} />;
          }
          if (route.name === 'Favorites') {
              return <Heart color={color} size={size} />;
          }
          return null;
        },
      })}
    >
      <Tab.Screen name="Library" options={{ tabBarLabel: 'My Music' }}>
        {() => <LibraryScreen isDarkMode={isDarkMode} />}
      </Tab.Screen>
      
      <Tab.Screen name="Folders" options={{ tabBarLabel: 'Folders' }}>
        {() => <FolderStack isDarkMode={isDarkMode} />}
      </Tab.Screen>
      
      <Tab.Screen name="Favorites" options={{ tabBarLabel: 'Loved' }}>
        {() => <FavoritesScreen isDarkMode={isDarkMode} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};
