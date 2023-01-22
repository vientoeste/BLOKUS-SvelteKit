import type { RequestHandler } from '@sveltejs/kit';
import { validate } from 'uuid';
import { putBlockOnBoard } from '../../game';

interface ReqBody {
    board: (string | number)[][],
    currentBlock: number[][],
    position: number[],
    rotation: number,
    player: string,
    flip?: boolean,
}

export const PATCH = (async ({ request }) => {
    const { board, currentBlock, position, rotation, player, flip } = await request.json()
    if (!board || !currentBlock || !position || !rotation || !player) {
        throw new Error('invalid parameter');
    }
    putBlockOnBoard(board, currentBlock, position, rotation, player, flip);

    return new Response(JSON.stringify(board));
}) satisfies RequestHandler;