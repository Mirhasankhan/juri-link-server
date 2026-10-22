const fs = require("fs");
const path = require("path");

const moduleName = process.argv[2];

if (!moduleName) {
  console.error(
    "❌ Please provide a module name.\nUsage: node module.js moduleName"
  );
  process.exit(1);
}

const baseDir = path.join(
  __dirname,
  "src",
  "app",
  "modules",
  moduleName.toLowerCase()
);

if (fs.existsSync(baseDir)) {
  console.error(`❌ Module "${moduleName}" already exists.`);
  process.exit(1);
}

fs.mkdirSync(baseDir, { recursive: true });

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const capModule = capitalize(moduleName);

const files = {
  [`${moduleName}.interface.ts`]: `export type T${capModule} = {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  userId: string;
};
`,

  [`${moduleName}.model.ts`]: `import { model, Schema } from "mongoose";
import { T${capModule} } from "./${moduleName}.interface";

const ${moduleName}Schema = new Schema<T${capModule}>(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    userId: { type: String, required: true, ref: "User" },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const ${capModule} = model<T${capModule}>("${capModule}", ${moduleName}Schema);
`,

  [`${moduleName}.service.ts`]: `import { T${capModule} } from "./${moduleName}.interface";
import { ${capModule} } from "./${moduleName}.model";

const create${capModule} = async (data: T${capModule}) => {
  await ${capModule}.create(data);
  return
};

const getAll${capModule}s = async () => {
  const results = await ${capModule}.find();
  return results
};

const get${capModule}ById = async (id: string) => {
  const result = await ${capModule}.findOne({ _id: id });
  return result
};

const update${capModule} = async (id: string, data: Partial<T${capModule}>) => {
  await ${capModule}.findOneAndUpdate({ _id: id }, data, { new: true });
  return
};

const delete${capModule} = async (id: string) => {
  await ${capModule}.findOneAndDelete({ _id: id });
  return 
};

export const ${moduleName}Services = {
  create${capModule},
  getAll${capModule}s,
  get${capModule}ById,
  update${capModule},
  delete${capModule},
};
`,

  [`${moduleName}.controller.ts`]: `import { ${moduleName}Services } from './${moduleName}.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

const create${capModule} = catchAsync(async (req, res) => {
  await ${moduleName}Services.create${capModule}(req.body, userId: req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "${capModule} created successfully",
  });
});

const getAll${capModule}s = catchAsync(async (req, res) => {
  const result = await ${moduleName}Services.getAll${capModule}s();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "All ${moduleName}s fetched successfully",
    data: result,
  });
});

const get${capModule}ById = catchAsync(async (req, res) => {
  const result = await ${moduleName}Services.get${capModule}ById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "${capModule} fetched successfully",
    data: result,
  });
});

const update${capModule} = catchAsync(async (req, res) => {
  await ${moduleName}Services.update${capModule}(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "${capModule} updated successfully",
  });
});

const delete${capModule} = catchAsync(async (req, res) => {
  await ${moduleName}Services.delete${capModule}(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "${capModule} deleted successfully",
  });
});

export const ${moduleName}Controllers = {
  create${capModule},
  getAll${capModule}s,
  get${capModule}ById,
  update${capModule},
  delete${capModule},
};
`,

  [`${moduleName}.routes.ts`]: `import express from 'express';
import { ${moduleName}Controllers } from "./${moduleName}.controller";
import auth from "../../middleware/auth";

const router = express.Router();

router.post('/', auth(), ${moduleName}Controllers.create${capModule});
router.get('/', auth(), ${moduleName}Controllers.getAll${capModule}s);
router.get('/:id', auth(), ${moduleName}Controllers.get${capModule}ById);
router.patch('/:id', auth(), ${moduleName}Controllers.update${capModule});
router.delete('/:id', auth(), ${moduleName}Controllers.delete${capModule});

export const ${moduleName}Routes = router;
`,
};

for (const [filename, content] of Object.entries(files)) {
  const filePath = path.join(baseDir, filename);
  fs.writeFileSync(filePath, content.trimStart());
}

console.log(
  `✅ ${capModule} module created with Mongoose at src/app/modules/${moduleName}`
);
