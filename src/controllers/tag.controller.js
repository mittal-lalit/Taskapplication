const { Tag } = require('../../models');

exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

exports.createTag = async (req, res) => {
  try {
    const {id,name}=req.body;
    if(!id || !name)
      return res.status(400).json({message:"id and name are required"});
    const tag=await Tag.create({
      id,
      name
    });
    res.status(201).json({message :"Tag created",tag});
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tag',error:error.message});
  }
};
