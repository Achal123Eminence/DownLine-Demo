import User from "../modules/users/user.model.js";
import { registerOwner } from "../modules/auth/auth.service.js";

const initializeOwner = async () => {
  const existingOwner = await User.findOne({
    role: 'OWNER'
  });

  if (existingOwner) {
    console.log(
      `Level 1 owner already exists: ${existingOwner.username}`
    );
    return;
  }

  console.log('No level 1 owner found. Creating owner...');

  await registerOwner({
    username: process.env.OWNER_USERNAME,
    email: process.env.OWNER_EMAIL,
    password: process.env.OWNER_PASSWORD
  });

  console.log('Level 1 owner created successfully');
};

export default initializeOwner;