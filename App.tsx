import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import NfcManager, { Ndef, NdefRecord, NfcTech } from 'react-native-nfc-manager';
import { getContainerStyles } from './scanner/dynamic-styles';
import Scanner from './scanner/Scanner';
import { SceneMap, TabView } from 'react-native-tab-view';
import Writer from './writer/Writer';

export type TicketStatus = "valid" | "invalid" | "already used" | "loading" | ""

type ResponseData = SuccessfulValidation | InvalidUserInput | NoTicketFound

type SuccessfulValidation = {
  message: string,
  name: string,
  status: string
}

type InvalidUserInput = {
  message: string;
  expected: Record<string, string>,
}

type NoTicketFound = {
  message: string;
}

const renderScene = SceneMap({
  scanner: Scanner,
  writer: Writer,
})

export default function App() {

  const layout = useWindowDimensions()

  const [index, setIndex] = useState(0)
  const [routes] = useState([
    { key: 'scanner', title: 'Scanner' },
    { key: 'writer', title: 'Writer' },
  ])

  NfcManager.start();

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }} />
  )
}