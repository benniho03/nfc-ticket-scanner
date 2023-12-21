import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';

type TicketStatus = "valid" | "invalid" | "already used" | "loading" | ""

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

export default function App() {

  const url = "https://nfc-ticket-one.vercel.app/api/tickets/"

  const [ticketStatus, setTicketStatus] = useState<TicketStatus>("")
  const [eventId, setEventId] = useState<string>("c74e067f-cd95-4ef5-bf05-801783895625")
  const [ticketId, setTicketId] = useState<string>("fba4b6f1-dafd-4028-8808-ad09c748a16a")
  const [name, setName] = useState("")

  async function getTicketStatus({ eventId, ticketId }: { eventId: string, ticketId: string }) {
    setTicketStatus("loading")
    const res = await fetch(url, {
      body: JSON.stringify({ eventId, ticketId }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })

    const data = await res.json()

    handleTicketStatus(data)

    setTimeout(() => {
      setTicketStatus("")
      setName("")
    }, 3000)

  }

  function displayTicketStatus() {
    if (ticketStatus === "valid") {
      return (
        <View style={{ display: "flex", alignItems: "center" }}>
          <AntDesign name="checkcircleo" size={56} color="white" />
          <Text style={{ fontSize: 24, color: "white" }}>Ticket Valid</Text>
          <Text style={{ fontSize: 40, color: "white" }}>{name}</Text>
        </View>
      )
    }
    if (ticketStatus === "invalid") {
      return (
        <View style={{ display: "flex", alignItems: "center" }}>
          <Entypo name="circle-with-cross" size={56} color="white" />
          <Text>Invalid Ticket</Text>
        </View>
      )
    }
    if (ticketStatus === "already used") {
      return (
        <View style={{ display: "flex", alignItems: "center" }}>
          <AntDesign name="minuscircleo" size={56} color="white" />
          <Text style={{ fontSize: 24, color: "white" }}>Already used</Text>
        </View>
      )
    }
    if (ticketStatus === "loading") {
      return (
        <ActivityIndicator size="large" color="white" />
      )
    }
    return null
  }

  function handleTicketStatus(data: ResponseData) {
    if (isSuccessfulData(data)) {
      setName(data.name)
      setTicketStatus("valid")
    }
    if (data.message === "Ticket already used") {
      setTicketStatus("already used")
    }
    if (data.message === "Ticket doesnt exsits") {
      setTicketStatus("invalid")
    }
  }

  function isSuccessfulData(data: ResponseData): data is SuccessfulValidation {
    return data.message === "Valid ticket"
  }

  return (
    <View style={getContainerStyles(ticketStatus)}>
      {displayTicketStatus()}
      <Text>Event ID</Text>
      <TextInput
        style={{ height: 80, borderColor: 'gray', borderWidth: 1, width: "80%", textAlign: "center" }}
        onChangeText={text => setEventId(text)}
        value={eventId}
      />
      <Text>Ticket ID</Text>
      <TextInput
        style={{ height: 80, borderColor: 'gray', borderWidth: 1, width: "80%", textAlign: "center" }}
        onChangeText={text => setTicketId(text)}
        value={ticketId}
      />
      <Button title="Submit" onPress={() => getTicketStatus({ eventId, ticketId })} />
      <StatusBar style="auto" />
    </View>
  );
}

function getContainerStyles(ticketStatus: TicketStatus) {
  if (ticketStatus === "valid") {
    return { ...styles.success, ...styles.container }
  }
  if (ticketStatus === "already used") {
    return { ...styles.alreadyUsed, ...styles.container }
  }
  if (ticketStatus === "invalid") {
    return { ...styles.invalid, ...styles.container }
  }
  if (ticketStatus === "loading") {
    return { ...styles.loading, ...styles.container }
  }
  return styles.container
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 40,
  },
  success: {
    backgroundColor: '#22c55e',
    color: "#0ea5e9",
  },
  alreadyUsed: {
    backgroundColor: '#f59e0b',
    color: "#0ea5e9"
  },
  invalid: {
    backgroundColor: '#ef4444',
    color: "white"
  },
  loading: {
    backgroundColor: "#0ea5e9",
    color: "white"
  }
});
