export interface ChatMessages {
    author: string;
    message: string;
}

export interface DataChannelPacket {
    type: string;
    data: any;
}