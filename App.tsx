import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import NfcManager, { } from 'react-native-nfc-manager';
import Scanner from './scanner/Scanner';
import { SceneMap, TabView } from 'react-native-tab-view';
import Writer from './writer/Writer';
import { QueryClient, QueryClientProvider } from 'react-query';


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
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }} />
    </QueryClientProvider>
  )
}