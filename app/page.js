/**
 * Pantry Management Application
 * This application helps manage pantry inventory using Next.js, Material UI, and Firebase.
 * The user can add, delete, and categorize items. The application is intended to be deployed using Vercel.
 */

'use client'
import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

// Styling for the modals
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600, 
  bgcolor: 'background.paper',
  border: '2px solid #1976d2', // blue border to match primary color
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  borderRadius: '8px',
}

// Categories for the items
const categories = [
  'Fruits', 'Vegetables', 'Dairy and Eggs', 'Meat and Poultry', 'Fish and Seafood', 'Undefined'
]

export default function Home() {
  // State management for inventory, modal visibility, item names, quantities, and error messages
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteQuantity, setDeleteQuantity] = useState(1)
  const [itemCategory, setItemCategory] = useState('Undefined')
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState('')

  // Function to update the inventory from Firestore
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  // Effect to fetch the inventory on component mount
  useEffect(() => {
    updateInventory()
  }, [])

  // Function to filter inventory based on search query
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Function to sort inventory based on selected sort option
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    switch (sortOption) {
      case 'quantity-asc':
        return a.quantity - b.quantity
      case 'quantity-desc':
        return b.quantity - a.quantity
      case 'category':
        return categories.indexOf(a.category) - categories.indexOf(b.category) // Custom category sort
      case 'alphabetical':
        return a.name.localeCompare(b.name)
      case 'last-added':
        return new Date(b.addedAt) - new Date(a.addedAt)
      case 'first-added':
        return new Date(a.addedAt) - new Date(b.addedAt)
      default:
        return 0
    }
  })

// Function to add items to the inventory with a timestamp
const addItem = async (item, quantity, category) => {
  const docRef = doc(collection(firestore, 'inventory'), item)
  const docSnap = await getDoc(docRef)
  const timestamp = new Date().toISOString()
  if (docSnap.exists()) {
    const { quantity: existingQuantity, category: existingCategory, addedAt } = docSnap.data()
    if (existingCategory && existingCategory !== category) {
      setError(`Error: "<i>${item}</i>" already exists in category "<i>${existingCategory}</i>". Cannot add to category "<i>${category}</i>".`)
      return false // Indicate that there was an error
    }
    await setDoc(docRef, { quantity: existingQuantity + quantity, category: existingCategory || category, addedAt })
  } else {
    await setDoc(docRef, { quantity, category, addedAt: timestamp })
  }
  await updateInventory()
  setError('') // Clear error if successful
  return true // Indicate that the item was added successfully
}

// Function to add a single item to the inventory with a timestamp
const addSingleItem = async (item) => {
  const docRef = doc(collection(firestore, 'inventory'), item)
  const docSnap = await getDoc(docRef)
  const timestamp = new Date().toISOString()
  if (docSnap.exists()) {
    const { quantity, category, addedAt } = docSnap.data()
    await setDoc(docRef, { quantity: quantity + 1, category, addedAt })
  } else {
    await setDoc(docRef, { quantity: 1, category: 'Uncategorized', addedAt: timestamp })
  }
  await updateInventory()
}

  // Function to delete a specified quantity of items from the inventory and ensure the category is updated
  const deleteItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity: existingQuantity, category } = docSnap.data()
      if (existingQuantity <= quantity) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: existingQuantity - quantity, category: category })
      }
      setError('') // Clear error if delete is successful
      handleDeleteClose() // Close modal if delete is successful
    } else {
      setError(`Error: "<i>${item}</i>" does not exist in inventory.`)
    }
    await updateInventory()
  }

  // Original removeItem function to remove a single item
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity, category } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1, category: category })
      }
    }
    await updateInventory()
  }

  // Handlers for opening and closing modals
  const handleOpen = () => {
    setError('') // Clear error when opening modal
    setOpen(true)
  }
  const handleClose = () => setOpen(false)
  const handleDeleteOpen = () => setDeleteOpen(true)
  const handleDeleteClose = () => setDeleteOpen(false)

  // Display and Functioning interface
  return (
    <Box
    width="100vw"
    height="100vh"
    display={'flex'}
    flexDirection={'column'}
    alignItems={'center'}
    gap={2}
    bgcolor={'#f7f7f7'} // Light background color
    padding={3} // Padding for better spacing
  >
    {/* Your Name at the Top Left */}
    <Box width="100%" display={'flex'} justifyContent={'flex-start'} paddingLeft={0} marginBottom={10}>
      <Typography variant="h7" color={'#333'}>
        Made by Sabeeh Hassany using Next.js, Material UI, and Firebase.
      </Typography>
    </Box>

      {/* Add Item Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-item"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              id="outlined-quantity"
              label="Quantity"
              type="number"
              variant="outlined"
              value={quantity}
              onChange={(e) => {
                const value = Math.max(1, Number(e.target.value))
                setQuantity(value)
              }}
              inputProps={{ min: 1 }}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={async () => {
                const success = await addItem(itemName, quantity, itemCategory)
                if (success) {
                  setItemName('')
                  setQuantity(1)
                  setItemCategory('Undefined')
                  handleClose()
                }
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Delete Item Modal */}
      <Modal
        open={deleteOpen}
        onClose={handleDeleteClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Delete Item
          </Typography>
          {error && (
            <Typography variant="body1" color="error">
              <span dangerouslySetInnerHTML={{ __html: error }} />
            </Typography>
          )}
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="delete-item"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value)
                setError('') // Clear error when input changes
              }}
            />
            <TextField
              id="delete-quantity"
              label="Quantity"
              type="number"
              variant="outlined"
              value={deleteQuantity}
              onChange={(e) => {
                const value = Math.max(1, Number(e.target.value))
                setDeleteQuantity(value)
                setError('') // Clear error when input changes
              }}
              inputProps={{ min: 1 }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                deleteItem(itemName, deleteQuantity)
              }}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Search Bar and Buttons UI*/}
      <Box display={'flex'} gap={2} alignItems="center">
        {/* Search Bar UI*/}
        <TextField
          id="search-bar"
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300 }}
        />

        {/* Add Button UI*/}
        <Button variant="contained" onClick={handleOpen}>
          Add Items
        </Button>

        {/* Delete Button UI*/}
        <Button variant="contained" onClick={handleDeleteOpen}>
          Delete Items
        </Button>

        {/* Sort Button UI*/}
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            label="Sort By"
          >
            <MenuItem value="quantity-asc">Quantity (Ascending)</MenuItem>
            <MenuItem value="quantity-desc">Quantity (Descending)</MenuItem>
            <MenuItem value="category">Category</MenuItem>
            <MenuItem value="alphabetical">Alphabetical</MenuItem>
            <MenuItem value="last-added">Last Added</MenuItem>
            <MenuItem value="first-added">First Added</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Inventory Items */}
      <Box border={'1px solid #333'}>
        <Box
          width="1200px" // increased the width by 50%
          height="100px"
          bgcolor={'#ADD8E6'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        
        {/* Header Row */}
        <Box
          width="1200px" // ensure this matches the width of the items container
          height="50px"
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          bgcolor={'#f0f0f0'}
          position="sticky"
          top="0"
          zIndex="10"
          borderBottom="1px solid #333"
          paddingX={5}
        >
          <Typography className="header-cell">Name</Typography>
          <Typography className="header-cell">Quantity</Typography>
          <Typography className="header-cell">Category</Typography>
          <Typography className="header-cell">Edit</Typography>
        </Box>

        {/* Items List */}
        <Stack width="1200px" height="500px" spacing={1} overflow={'auto'}>
          {sortedInventory.map(({ name, quantity, category }) => (
            <Box
              key={name}
              width="100%"
              minHeight="75px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f0f0f0'}
              paddingX={5}
            >
              <Typography className="item-cell" sx={{ flex: 1 }}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography className="item-cell" sx={{ flex: 1, textAlign: 'center' }}>
                {quantity !== undefined ? quantity : 0}
              </Typography>
              <Typography className="item-cell" sx={{ flex: 1, textAlign: 'center' }}>
                {category}
              </Typography>
              <Box display={'flex'} justifyContent={'center'} alignItems={'center'} width="100px">
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => addSingleItem(name)}
                  style={{ marginRight: '5px', transition: 'background-color 0.3s' }}
                  sx={{ '&:hover': { backgroundColor: '#1976d2', color: 'white' } }}
                >
                  +
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => removeItem(name)}
                  style={{ transition: 'background-color 0.3s' }}
                  sx={{ '&:hover': { backgroundColor: '#1976d2', color: 'white' } }}
                >
                  -
                </Button>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}