
export const initInvitationToBoardSocket = (socket) => {
    socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
        console.log('📩 Received invitation:', invitation)
        socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
    })

    socket.on('FE_JOIN_BOARD', (boardId) => {
        if (boardId) socket.join(`board:${boardId}`)
    })

    socket.on('FE_BOARD_ORDER_UPDATED', (boardOrderUpdate) => {
        if (!boardOrderUpdate?.boardId) return

        socket.to(`board:${boardOrderUpdate.boardId}`).emit(
            'BE_BOARD_ORDER_UPDATED',
            boardOrderUpdate
        )
    })
}