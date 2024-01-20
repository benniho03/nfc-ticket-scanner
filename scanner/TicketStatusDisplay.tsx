import React from "react"
import { TicketStatus } from "./Scanner"
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons'; // Add this import statement
import { Entypo } from '@expo/vector-icons'; // Add this import statement


export function DisplayTicketStatus({ ticketStatus, name }: { ticketStatus: TicketStatus, name: string }) {
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

                // Rest of the code...
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