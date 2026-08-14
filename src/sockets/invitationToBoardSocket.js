
export const initInvitationToBoardSocket = (socket) => {
    socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
        console.log('📩 Received invitation:', invitation)
        socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
    })
}