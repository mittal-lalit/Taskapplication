const { Tag } = require('../../models');

exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.status(200).json({tags});
  } catch (error) {
    res.status(500).json({success: false,error: 'Internal Server Error',message: error.message,});
  }
};

exports.createTag = async (req, res) => {
  try {
    const {name}=req.body;
    if (!name || name.trim() === "") {
  return res.status(400).json({ message: "Tag name is required" });
}

const existing = await Tag.findOne({ where: { name } });
if (existing) {
  return res.status(409).json({ message: "Tag already exists" });
}
    const tag = await Tag.create({ name: name.trim() });

    res.status(201).json({message : "Tag created",tag});
  } catch (error) {
    res.status(500).json({ message: 'Failed to create tag',error:error.message });
  }
};
