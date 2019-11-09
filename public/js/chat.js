const socket = io()


const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Visible height
  const visibleHeight = $messages.offsetHeight

  // Height of messages container
  const containerHeight = $messages.scrollHeight

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }
  
}

socket.on('message', (messageData) => {
  console.log(messageData)
  const html = Mustache.render(messageTemplate, {  
    username: messageData.username, // this is for mustache message
    message: messageData.text, // this is for mustache message
    createdAt: moment(messageData.createdAt).format('hh:mm a') // this is for mustache message
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})




socket.on('locationMessage', (locationData) => {
  const html = Mustache.render(locationTemplate, {
    locationUrl: locationData.url, // this is for mustache message
    createdAt: moment(locationData.createdAt).format('hh:mm a') , // this is for mustache message
    username: locationData.username  // this is for mustache message
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('roomData', ( {room, users} ) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html
})

// messageString = ""


const inputElement = document.querySelector('#message-form input')

const sendButton = document.querySelector('button').onclick = (e) => {
  e.preventDefault()
  if (inputElement.value !== '') {
    socket.emit('sendMessage', inputElement.value, (error) => {
      if(error) {
        return console.log(error)
      }
      // console.log('Message delivered!')
    }) 
    inputElement.value = ''
    inputElement.focus()
  }
}

// Send Location Button
const locationButton = document.querySelector('#send-location')
locationButton.addEventListener('click', () => {
  locationButton.disabled = true

  if (! navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.')
  }

  navigator.geolocation.getCurrentPosition( (position) => {

    socket.emit('sendLocation',       
      {  // coordinates object
      latitude: position.coords.latitude, 
      longitude: position.coords.longitude, 
      },
      
      () => {  // callback function
        console.log('Location Shared')
        locationButton.disabled = false
      }

    ) // socket.emit END
    // console.log(position)
  }) // getCurrentPosition END  
}) // addEventListener END


socket.emit('join', {username, room}, (error) => {
  if(error) {
    alert(error)
    location.href='/'
  }
}) 


// socket.on('countUpdated', (count) => {
//   console.log('Count has been updated!', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//   console.log('Clicked')
//   socket.emit('increment')
// })



// navigator.geolocation.getCurrentPosition(pos => console.log(pos.coords.latitude) )