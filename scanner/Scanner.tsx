import { useState } from 'react';
import { Alert, Button, TouchableOpacity, View } from 'react-native';
import NfcManager, { Ndef, NdefRecord, NfcTech } from 'react-native-nfc-manager';
import { getContainerStyles } from './dynamic-styles';
import { ticketSchema } from '../writer/Writer'
import { z } from 'zod';
import { DisplayTicketStatus } from './TicketStatusDisplay';
import { readNdef } from '../util/nfc-io';

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

export default function Scanner() {

    const url = "https://nfc-ticket-one.vercel.app/api/tickets"

    const [ticketStatus, setTicketStatus] = useState<TicketStatus>("")
    const [name, setName] = useState("")

    async function getTicketStatus({ id, eventId }: { id: string, eventId: string }) {
        setTicketStatus("loading")
        const res = await fetch(url, {
            body: JSON.stringify({ ticketId: id, eventId }),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        })
        setTicketStatus("")

        return await res.json() as ResponseData

    }

    function displayTicketStatus(data: ResponseData) {
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

    async function handleScan() {
        const message = await readNdef()
        if (!message) {
            return console.error("No message found")
        }
        const ticket = JSON.parse(message)

        if (!validateTicket(ticket)) {
            return Alert.alert("Failed to read ticket")
        }

        const ticketStatus = await getTicketStatus(ticket)

        displayTicketStatus(ticketStatus)

        // Reset after 3 seconds
        setTimeout(() => {
            setTicketStatus("")
            setName("")
        }, 3000)

    }

    return (
        <View style={getContainerStyles(ticketStatus)}>
            <Button title="Start Scanning..." onPress={handleScan} />
            <DisplayTicketStatus ticketStatus={ticketStatus} name={name} />
        </View>
    );
}

function isSuccessfulData(data: ResponseData): data is SuccessfulValidation {
    return data.message === "Valid ticket"
}

function validateTicket(ticket: any): ticket is z.infer<typeof ticketSchema> {
    return ticketSchema.safeParse(ticket).success
}

