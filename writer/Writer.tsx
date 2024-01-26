import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, Image, ScrollView, Text, View } from "react-native";
import { z } from "zod";
import { writeNdef } from "../util/nfc-io";
import { useQuery } from "react-query";
import { AntDesign } from "@expo/vector-icons";


export const ticketSchema = z.object({
    id: z.string(),
    eventId: z.string(),
})

export default function Writer() {

    const url = "https://nfc-ticket-one.vercel.app/api/ticketProduced"

    const [message, setMessage] = useState("")
    const [currentTicket, setCurrentTicket] = useState<z.infer<typeof ticketSchema>>()
    const [tickets, setTickets] = useState<z.infer<typeof ticketSchema>[]>([])

    const { data, isLoading, error } = useQuery(url, async () => {
        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ API_KEY: "421c76d77563afa1914846b010bd164f395bd34c2102e5e99e0cb9cf173c1d87" }),
            method: 'POST'
        })
        const data = await res.json()
        if (!validateTickets(data)) throw new Error("Invalid response from server")
        setTickets(data)
        return data
    })

    if (isLoading) return <ActivityIndicator />
    if (!data || !data.length) return <Text>No Tickets found to generate.</Text>
    if (error) return <Text>{JSON.stringify(error)}</Text>

    async function handleWrite({ id, eventId }: z.infer<typeof ticketSchema>) {

        setCurrentTicket({ id, eventId })

        const success = await writeNFC({ id, eventId })
        if (success) {
            setMessage("Ticket written") 
            updateTicketProduced({ id, eventId })
            setTickets(tickets!.filter((ticket) => ticket.id !== id))
        } else {
            setMessage("Failed to write ticket")
        }
        setCurrentTicket(undefined)

    }

    function cancelWrite() {
        setCurrentTicket(undefined)
    }

    return (
        <View style={{ height: "100%", padding: 6, display: "flex", alignItems: "center" }}>
            <Text>Tickets to generate: {tickets.length}</Text>
            <Text>{message}</Text>
            <WritingDisplay ticket={currentTicket} cancelWrite={cancelWrite} />
            <View style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
                height: "100%",
                flexGrow: 1,
                gap: 5,
            }}>

                {
                    tickets.slice(0, 5).map((ticket) => {

                        return <View key={ticket.id} style={{ marginBottom: 5 }} >
                            {
                                ticket.id === currentTicket?.id ?
                                    <Button disabled={ticket.id === currentTicket?.id} title={ticket.id.slice(0, 5)} /> :
                                    <Button onPress={() => handleWrite({ ...ticket })} title={ticket.id.slice(0, 5)} />
                            }
                        </View>
                    })
                }
            </View>


        </View>
    )
}

function WritingDisplay({ ticket, cancelWrite }: { ticket?: z.infer<typeof ticketSchema>, cancelWrite: () => void }) {
    if (!ticket) return <Text>What Ticket do you want to write?</Text>
    return (
        <View style={{
            display: "flex",
            alignItems: "center",
        }}>
            <AntDesign name="scan1" size={56} color="black" />
            <Text>Writing {ticket.id.slice(0, 5)}</Text>
            <Button title="Cancel" onPress={cancelWrite} color="#dc2626" />
        </View>
    )
}

function validateTickets(tickets: any): tickets is z.infer<typeof ticketSchema>[] {
    const responseSchema = z.array(ticketSchema)
    return responseSchema.safeParse(tickets).success
}


async function writeNFC({ id, eventId }: z.infer<typeof ticketSchema>) {
    return await writeNdef({ type: "TEXT", value: JSON.stringify({ id, eventId }) })
}

async function updateTicketProduced({ id, eventId }: z.infer<typeof ticketSchema>) {
    const url = "https://nfc-ticket-one.vercel.app/api/ticketProduced/produced"

    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ API_KEY: "421c76d77563afa1914846b010bd164f395bd34c2102e5e99e0cb9cf173c1d87", id, eventId }),
        method: 'POST'
    })

    return await res.json()
}