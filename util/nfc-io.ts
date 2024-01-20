import NfcManager, { NfcTech, NdefRecord, Ndef } from "react-native-nfc-manager";

export async function readNdef() {
    try {
        await NfcManager.requestTechnology(NfcTech.Ndef);
        const tag = await NfcManager.getTag();

        if (!tag) {
            return console.error("No tag found")
        }

        return decodeNdefRecord(tag.ndefMessage)
    } catch (ex) {
        console.warn('Oops!', ex);
    } finally {
        NfcManager.cancelTechnologyRequest();
    }
}

export function decodeNdefRecord(ndefRecords: NdefRecord[]) {

    const record = ndefRecords[0]

    if (!isRecordUint8Array(record.payload)) {
        console.log(record.payload)
        throw new Error("Couldn't decode payload")
    }
    if (isTextRecord(record)) {
        return Ndef.text.decodePayload(record.payload)
    }
    if (isURIRecord(record)) {
        return Ndef.uri.decodePayload(record.payload)
    }

    function isTextRecord(record: NdefRecord) {
        return Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT)
    }

    function isURIRecord(record: NdefRecord) {
        return Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_URI)
    }

    function isRecordUint8Array(payload: unknown): payload is Uint8Array {
        return true
    }
}

export async function writeNdef({ type, value }: { type: string, value: string }) {
    let bytes;

    if (type === 'TEXT') {
        bytes = Ndef.encodeMessage([Ndef.textRecord(value)]);
    } else {
        throw new Error('Unsupported type');
    }

    try {
        await NfcManager.requestTechnology(NfcTech.Ndef);

        await NfcManager.ndefHandler.writeNdefMessage(bytes);

        return true

    } catch (err) {
        console.warn(err);
        return false
    } finally {
        NfcManager.cancelTechnologyRequest();
    }
}