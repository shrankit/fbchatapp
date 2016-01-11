module.exports = function(io, rooms){
    var chatRooms = io.of('/roomlist').on('connection', function(socket){
        console.log('Connection Established on Server');
        socket.emit('roomupdate',JSON.stringify(rooms));
        
        socket.on('newroom',function(data){
        rooms.push(data);
            
            socket.broadcast.emit('roomupdate',JSON.stringify(rooms));
            socket.emit('roomupdate',JSON.stringify(rooms));
        
        })
    })
    
    var messages = io.of('/messages').on('connection',  function(socket){
        console.log('Connected to the Chat Room')
        
        socket.on('joinroom', function(data){
            socket.username = data.user;
            socket.userPic = data.userPic;
            socket.join(data.room);
            console.log(data.room);
            updateUserList(data.room, true);
        })
        
        socket.on('newMessage',function(data){
            socket.broadcast.to(data.room_number).emit('messagefeed', JSON.stringify(data));
        });
        
         function updateUserList(room, updateAll){
        
             
            //var getUsers = io.of('/messages').clients(room);
             //var getUsers = io.of('/messages').adapter.rooms[room];
             
            var userList = [];
            
            
             
             var clients = findClientsSocket(null,'/messages') ;
             //console.log(clients);
             
             for(var i in clients){
                console.log(clients[i].username)
                userList.push({
                    user: clients[i].username,
                    userPic: clients[i].userPic
                })
            }
             
        
             //socket.broadcast.to(room).emit('updateUsersList', JSON.stringify(userList));
             //io.to(room).emit('updateUsersList', JSON.stringify(userList));
             io.of('/messages').to(room).emit('updateUsersList', JSON.stringify(userList));
             //socket.to(room).emit('updateUsersList', JSON.stringify(userList));;
             
             if(updateAll){
                 socket.broadcast.to(room).emit('updateUsersList', JSON.stringify(userList));
             }
        }
        
        function findClientsSocketByRoomId(roomId) {
            var res = []
            , room = io.sockets.adapter.rooms[roomId];
            if (room) {
                for (var id in room) {
                res.push(io.sockets.adapter.nsp.connected[id]);
                }
            }
            return res;
        }
        
        function findClientsSocket(roomId, namespace) {
            var res = []
            , ns = io.of(namespace ||"/");    // the default namespace is "/"

            if (ns) {
                for (var id in ns.connected) {
                    if(roomId) {
                        var index = ns.connected[id].rooms.indexOf(roomId) ;
                        if(index !== -1) {
                            res.push(ns.connected[id]);
                        }
                    } else {
                        res.push(ns.connected[id]);
                    }
                }
            }
            return res;
        }
        
        socket.on('updateList', function(data){
            updateUserList(data.room, true);
        })
    })
    
   
    
    
}