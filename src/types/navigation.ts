import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';

// ============================================================================
// Navigation Parameter Lists
// ============================================================================

/**
 * Parameter list for the Folder Stack.
 */
export type FolderStackParamList = {
  FoldersList: undefined;
  FolderDetail: { folderName: string };
};

/**
 * Parameter list for the Main Tab Navigator.
 */
export type MainTabParamList = {
  Library: undefined;
  Folders: undefined; // This leads to the FolderStack
  Favorites: undefined;
};

// ============================================================================
// Screen Props Types
// ============================================================================

/**
 * Props for screens in the Main Tab Navigator.
 */
export type MainTabScreenProps<T extends keyof MainTabParamList> = 
  BottomTabScreenProps<MainTabParamList, T>;

/**
 * Props for screens in the Folder Stack, including access to parent tab navigation.
 */
export type FolderStackScreenProps<T extends keyof FolderStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<FolderStackParamList, T>,
    BottomTabScreenProps<MainTabParamList, 'Folders'>
  >;
