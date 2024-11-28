const Role = require("../models/roleModel");

const createRole = async (req, res) => {
  try {
    const { name } = req.body;

    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({ message: "Role already exists" });
    }
    const newRole = await Role.create({ name });

    res
      .status(200)
      .json({ message: "Role created successfully", role: newRole });
  } catch (error) {
    console.error("error creating role:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    await role.destroy();
    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("error deleting role:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createRole, deleteRole };
