import type NodeCache from 'node-cache'
import type { Logger } from 'pino'
import type { Readable } from 'stream'
import type { URL } from 'url'
import { proto } from '../../WAProto'
import type { GroupMetadata } from './GroupMetadata'

// export the WAMessage Prototypes
export { proto as WAProto }
export type WAMessage = proto.IWebMessageInfo
export type WAMessageContent = proto.IMessage
export type WAContactMessage = proto.IContactMessage
export type WAContactsArrayMessage = proto.IContactsArrayMessage
export type WAMessageKey = proto.IMessageKey
export type WATextMessage = proto.IExtendedTextMessage
export type WAContextInfo = proto.IContextInfo
export type WALocationMessage = proto.ILocationMessage
export type WAGenericMediaMessage = proto.IVideoMessage | proto.IImageMessage | proto.IAudioMessage | proto.IDocumentMessage | proto.IStickerMessage
export import WAMessageStubType = proto.WebMessageInfo.WebMessageInfoStubType
export import WAMessageStatus = proto.WebMessageInfo.WebMessageInfoStatus
export type WAMediaUpload = Buffer | { url: URL | string } | { stream: Readable }
/** Set of message types that are supported by the library */
export type MessageType = keyof proto.Message

export type DownloadableMessage = { mediaKey?: Uint8Array, directPath?: string, url?: string }

export type MessageReceiptType = 'read' | 'read-self' | 'hist_sync' | 'peer_msg' | 'sender' | 'inactive' | undefined

export type MediaConnInfo = {
    auth: string
    ttl: number
    hosts: { hostname: string, maxContentLengthBytes: number }[]
    fetchDate: Date
}

export interface WAUrlInfo {
    'canonical-url': string
    'matched-text': string
    title: string
    description: string
    jpegThumbnail?: Buffer
}

// types to generate WA messages
type Mentionable = {
    /** list of jids that are mentioned in the accompanying text */
    mentions?: string[]
}
type ViewOnce = {
    viewOnce?: boolean
}
type Buttonable = {
    /** add buttons to the message  */
    buttons?: proto.IButton[]
}
type Templatable = {
    /** add buttons to the message (conflicts with normal buttons)*/
    templateButtons?: proto.IHydratedTemplateButton[]

    footer?: string
}
type Listable = {
    /** Sections of the List */
    sections?: proto.ISection[]

    /** Title of a List Message only */
    title?: string

    /** Text of the bnutton on the list (required) */
    buttonText?: string
}
type WithDimensions = {
    width?: number
    height?: number
}
export type MediaType = 'image' | 'video' | 'sticker' | 'audio' | 'document' | 'history' | 'md-app-state'
export type AnyMediaMessageContent = (
    ({
        image: WAMediaUpload
        caption?: string
        jpegThumbnail?: string
    } & Mentionable & Buttonable & Templatable & WithDimensions) |
    ({
        video: WAMediaUpload
        caption?: string
        gifPlayback?: boolean
        jpegThumbnail?: string
    } & Mentionable & Buttonable & Templatable & WithDimensions) | {
        audio: WAMediaUpload
        /** if set to true, will send as a `voice note` */
        ptt?: boolean
        /** optionally tell the duration of the audio */
        seconds?: number
    } | ({
        sticker: WAMediaUpload
        isAnimated?: boolean 
    } & WithDimensions) | ({
        document: WAMediaUpload
        mimetype: string
        fileName?: string
    } & Buttonable & Templatable)) &
    { mimetype?: string }

export type ButtonReplyInfo = {
    displayText: string
    id: string
    index: number
}

export type AnyRegularMessageContent = (
    ({
	    text: string
        linkPreview?: WAUrlInfo | null
    }
    & Mentionable & Buttonable & Templatable & Listable) |
    AnyMediaMessageContent |
    {
        contacts: {
            displayName?: string
            contacts: proto.IContactMessage[]
        }
    } |
    {
        location: WALocationMessage
    } | {
        react: proto.IReactionMessage
    } | {
        buttonReply: ButtonReplyInfo
        type: 'template' | 'plain'
    }
) & ViewOnce

export type AnyMessageContent = AnyRegularMessageContent | {
	forward: WAMessage
	force?: boolean
} | {
	delete: WAMessageKey
} | {
	disappearingMessagesInChat: boolean | number
}

export type GroupMetadataParticipants = Pick<GroupMetadata, 'participants'>

type MinimalRelayOptions = {
    /** override the message ID with a custom provided string */
    messageId?: string
    /** cached group metadata, use to prevent redundant requests to WA & speed up msg sending */
    cachedGroupMetadata?: (jid: string) => Promise<GroupMetadataParticipants | undefined>
}

export type MessageRelayOptions = MinimalRelayOptions & {
    /** only send to a specific participant; used when a message decryption fails for a single user */
    participant?: string
    /** additional attributes to add to the WA binary node */
    additionalAttributes?: { [_: string]: string }
}

export type MiscMessageGenerationOptions = MinimalRelayOptions & {
    /** optional, if you want to manually set the timestamp of the message */
	timestamp?: Date
    /** the message you want to quote */
	quoted?: WAMessage
    /** disappearing messages settings */
    ephemeralExpiration?: number | string
    /** timeout for media upload to WA server */
    mediaUploadTimeoutMs?: number
}
export type MessageGenerationOptionsFromContent = MiscMessageGenerationOptions & {
	userJid: string
}

export type WAMediaUploadFunction = (readStream: Readable, opts: { fileEncSha256B64: string, mediaType: MediaType, timeoutMs?: number }) => Promise<{ mediaUrl: string, directPath: string }>

export type MediaGenerationOptions = {
	logger?: Logger
    upload: WAMediaUploadFunction
    /** cache media so it does not have to be uploaded again */
    mediaCache?: NodeCache

    mediaUploadTimeoutMs?: number
}
export type MessageContentGenerationOptions = MediaGenerationOptions & {
	getUrlInfo?: (text: string) => Promise<WAUrlInfo>
}
export type MessageGenerationOptions = MessageContentGenerationOptions & MessageGenerationOptionsFromContent

export type MessageUpdateType = 'append' | 'notify' | 'replace'

export type MessageUserReceipt = proto.IUserReceipt

export type WAMessageUpdate = { update: Partial<WAMessage>, key: proto.IMessageKey }

export type WAMessageCursor = { before: WAMessageKey | undefined } | { after: WAMessageKey | undefined }

export type MessageUserReceiptUpdate = { key: proto.IMessageKey, receipt: MessageUserReceipt }

export type MediaDecryptionKeyInfo = {
    iv: Buffer
    cipherKey: Buffer
    macKey?: Buffer
}

export type MinimalMessage = Pick<proto.IWebMessageInfo, 'key' | 'messageTimestamp'>
