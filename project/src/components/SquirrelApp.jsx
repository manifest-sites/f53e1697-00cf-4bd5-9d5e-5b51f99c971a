import { useState, useEffect } from 'react'
import { Button, Card, Input, Select, Form, Modal, Table, Tag, Rate, message, Space, Tooltip } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, HeartOutlined, HeartFilled, EyeOutlined } from '@ant-design/icons'
import { Squirrel } from '../entities/Squirrel'

const { TextArea } = Input
const { Option } = Select

function SquirrelApp() {
  const [squirrels, setSquirrels] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingSquirrel, setEditingSquirrel] = useState(null)
  const [viewingSquirrel, setViewingSquirrel] = useState(null)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const squirrelSpecies = [
    'Gray Squirrel',
    'Red Squirrel',
    'Flying Squirrel',
    'Ground Squirrel',
    'Fox Squirrel',
    'Chipmunk',
    'Tree Squirrel',
    'Other'
  ]

  const sizeOptions = ['Small', 'Medium', 'Large']
  const colorOptions = ['Gray', 'Brown', 'Red', 'Black', 'White', 'Mixed']
  const behaviorOptions = [
    'Foraging for nuts',
    'Climbing trees',
    'Building nest',
    'Playing',
    'Sleeping',
    'Eating',
    'Running',
    'Jumping between trees',
    'Burying food',
    'Grooming'
  ]

  const loadSquirrels = async () => {
    setLoading(true)
    try {
      const result = await Squirrel.list()
      if (result.success) {
        setSquirrels(result.data)
      }
    } catch (error) {
      message.error('Failed to load squirrels')
    }
    setLoading(false)
  }

  const handleSubmit = async (values) => {
    try {
      const squirrelData = {
        ...values,
        dateSpotted: values.dateSpotted || new Date().toISOString().split('T')[0],
        isFavorite: values.isFavorite || false
      }

      let result
      if (editingSquirrel) {
        result = await Squirrel.update(editingSquirrel._id, squirrelData)
        message.success('Squirrel updated successfully!')
      } else {
        result = await Squirrel.create(squirrelData)
        message.success('Squirrel added successfully!')
      }

      if (result.success) {
        loadSquirrels()
        setIsModalVisible(false)
        setEditingSquirrel(null)
        form.resetFields()
      }
    } catch (error) {
      message.error('Failed to save squirrel')
    }
  }

  const handleEdit = (squirrel) => {
    setEditingSquirrel(squirrel)
    form.setFieldsValue(squirrel)
    setIsModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      // Since there's no delete method in the API, we'll just remove from local state
      setSquirrels(squirrels.filter(s => s._id !== id))
      message.success('Squirrel removed!')
    } catch (error) {
      message.error('Failed to delete squirrel')
    }
  }

  const toggleFavorite = async (squirrel) => {
    try {
      const updatedSquirrel = { ...squirrel, isFavorite: !squirrel.isFavorite }
      const result = await Squirrel.update(squirrel._id, updatedSquirrel)
      if (result.success) {
        loadSquirrels()
        message.success(updatedSquirrel.isFavorite ? 'Added to favorites!' : 'Removed from favorites!')
      }
    } catch (error) {
      message.error('Failed to update favorite status')
    }
  }

  const handleView = (squirrel) => {
    setViewingSquirrel(squirrel)
    setIsViewModalVisible(true)
  }

  useEffect(() => {
    loadSquirrels()
  }, [])

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <span className="font-semibold">{name}</span>
          {record.isFavorite && <HeartFilled className="text-red-500" />}
        </Space>
      ),
    },
    {
      title: 'Species',
      dataIndex: 'species',
      key: 'species',
      render: (species) => <Tag color="blue">{species}</Tag>,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size) => <Tag color="green">{size}</Tag>,
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      render: (color) => <Tag color="orange">{color}</Tag>,
    },
    {
      title: 'Date Spotted',
      dataIndex: 'dateSpotted',
      key: 'dateSpotted',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, squirrel) => (
        <Space>
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} onClick={() => handleView(squirrel)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} onClick={() => handleEdit(squirrel)} />
          </Tooltip>
          <Tooltip title={squirrel.isFavorite ? "Remove from Favorites" : "Add to Favorites"}>
            <Button 
              icon={squirrel.isFavorite ? <HeartFilled /> : <HeartOutlined />}
              onClick={() => toggleFavorite(squirrel)}
              className={squirrel.isFavorite ? "text-red-500" : ""}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(squirrel._id)} />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const favoriteSquirrels = squirrels.filter(s => s.isFavorite)
  const totalSpottings = squirrels.length
  const uniqueSpecies = new Set(squirrels.map(s => s.species)).size

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Squirrel Tracker</h1>
          <p className="text-gray-600">Keep track of all the amazing squirrels you encounter!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="text-center">
            <div className="text-3xl font-bold text-blue-600">{totalSpottings}</div>
            <div className="text-gray-600">Total Squirrels</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-green-600">{uniqueSpecies}</div>
            <div className="text-gray-600">Species Found</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-red-600">{favoriteSquirrels.length}</div>
            <div className="text-gray-600">Favorites</div>
          </Card>
        </div>

        {/* Add Squirrel Button */}
        <div className="mb-6">
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={() => {
              setEditingSquirrel(null)
              form.resetFields()
              setIsModalVisible(true)
            }}
          >
            Add New Squirrel
          </Button>
        </div>

        {/* Squirrels Table */}
        <Card>
          <Table 
            columns={columns} 
            dataSource={squirrels} 
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          title={editingSquirrel ? "Edit Squirrel" : "Add New Squirrel"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false)
            setEditingSquirrel(null)
            form.resetFields()
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="mt-4"
          >
            <Form.Item
              name="name"
              label="Squirrel Name"
              rules={[{ required: true, message: 'Please enter a name for the squirrel!' }]}
            >
              <Input placeholder="e.g., Nutkin, Chippy, Acorn" />
            </Form.Item>

            <Form.Item
              name="species"
              label="Species"
              rules={[{ required: true, message: 'Please select a species!' }]}
            >
              <Select placeholder="Select a species">
                {squirrelSpecies.map(species => (
                  <Option key={species} value={species}>{species}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="location"
              label="Location Spotted"
              rules={[{ required: true, message: 'Please enter the location!' }]}
            >
              <Input placeholder="e.g., Central Park, My Backyard, Oak Tree" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="size" label="Size">
                <Select placeholder="Select size">
                  {sizeOptions.map(size => (
                    <Option key={size} value={size}>{size}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="color" label="Color">
                <Select placeholder="Select color">
                  {colorOptions.map(color => (
                    <Option key={color} value={color}>{color}</Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Form.Item name="behavior" label="Behavior Observed">
              <Select placeholder="Select behavior">
                {behaviorOptions.map(behavior => (
                  <Option key={behavior} value={behavior}>{behavior}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="dateSpotted" label="Date Spotted">
              <Input type="date" />
            </Form.Item>

            <Form.Item name="notes" label="Notes">
              <TextArea rows={3} placeholder="Any additional observations or notes..." />
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button onClick={() => {
                setIsModalVisible(false)
                setEditingSquirrel(null)
                form.resetFields()
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingSquirrel ? 'Update' : 'Add'} Squirrel
              </Button>
            </div>
          </Form>
        </Modal>

        {/* View Modal */}
        <Modal
          title={`🐿️ ${viewingSquirrel?.name}`}
          open={isViewModalVisible}
          onCancel={() => setIsViewModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsViewModalVisible(false)}>
              Close
            </Button>
          ]}
          width={500}
        >
          {viewingSquirrel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Species:</strong>
                  <div><Tag color="blue">{viewingSquirrel.species}</Tag></div>
                </div>
                <div>
                  <strong>Location:</strong>
                  <div>{viewingSquirrel.location}</div>
                </div>
                <div>
                  <strong>Size:</strong>
                  <div><Tag color="green">{viewingSquirrel.size}</Tag></div>
                </div>
                <div>
                  <strong>Color:</strong>
                  <div><Tag color="orange">{viewingSquirrel.color}</Tag></div>
                </div>
              </div>
              
              <div>
                <strong>Behavior:</strong>
                <div>{viewingSquirrel.behavior}</div>
              </div>
              
              <div>
                <strong>Date Spotted:</strong>
                <div>{viewingSquirrel.dateSpotted}</div>
              </div>
              
              <div>
                <strong>Favorite:</strong>
                <div>{viewingSquirrel.isFavorite ? '❤️ Yes' : '🤍 No'}</div>
              </div>
              
              {viewingSquirrel.notes && (
                <div>
                  <strong>Notes:</strong>
                  <div className="bg-gray-50 p-3 rounded mt-1">{viewingSquirrel.notes}</div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}

export default SquirrelApp