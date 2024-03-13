const express = require("express");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const region = "us-east-1";
const tableName = "Users";

const router = express.Router();

AWS.config.update({ region });
const dynamodb = new AWS.DynamoDB.DocumentClient();

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const params = {
      TableName: tableName,
      Key: {
        UserId: userId,
      },
    };

    const data = await dynamodb.get(params).promise();

    if (!data.Item) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(data.Item);
  } catch (error) {
    console.error("Error getting user data from DynamoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const params = {
      TableName: tableName,
      Item: {
        UserId: userId,
        name,
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isVerified: false,
        isAdmin: false,
      },
    };

    await dynamodb.put(params).promise();
    res.status(201).json({ userId, message: "User data added successfully" });
  } catch (error) {
    console.error("Error adding user data to DynamoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const params = {
      TableName: tableName,
      Key: {
        UserId: userId,
      },
      UpdateExpression:
        "set #name = :name, email = :email, updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#name": "name",
      },
      ExpressionAttributeValues: {
        ":name": name,
        ":email": email,
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    };

    const data = await dynamodb.update(params).promise();
    res.status(200).json(data.Attributes);
  } catch (error) {
    console.error("Error updating user in DynamoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const params = {
      TableName: tableName,
      Key: {
        UserId: userId,
      },
    };

    await dynamodb.delete(params).promise();
    res.status(200).json({ userId, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user from DynamoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
