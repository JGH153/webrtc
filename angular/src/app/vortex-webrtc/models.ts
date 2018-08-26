export interface ChatMessages {
	author: string;
	message: string;
}

export interface DataChannelPacket {
	type: string;
	data: any;
}

export interface MatchDataPacket extends DataChannelPacket {
	yourUserId: number;
	matchId: number | null;
}


