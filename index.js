#!/usr/bin/env node

import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const { version } = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json'), 'utf8'))

const templatePath = path.resolve(__dirname, 'templates')

const FRAMEWORK = {
    type: "list",
    name: "framework",
    message: "Select a framework:",
    choices: [],
}

const BUNDLER = {
    type: "list",
    name: "bundler",
    message: "Select a bundler:",
    choices: [],
}

const VARIANT = {
    type: "list",
    name: "variant",
    message: "Select a variant:",
    choices: [],
}

const PROJECTNAME = {
    type: "input",
    name: "projectName",
    message: "Project name:",
    default: "vue3-project",
}

for (const templateName of fs.readdirSync(templatePath)) {
    const [framework, bundler, variant] = templateName.split('-')
    FRAMEWORK.choices.push(framework)
    BUNDLER.choices.push(bundler)
    VARIANT.choices.push(variant)
}

FRAMEWORK.choices = [...new Set(FRAMEWORK.choices)]
BUNDLER.choices = [...new Set(BUNDLER.choices)]
VARIANT.choices = [...new Set(VARIANT.choices)]

let spinner = null

inquirer
    .prompt([
        FRAMEWORK,
        BUNDLER,
        VARIANT,
        PROJECTNAME
    ])
    .then((answers) => {
        console.log(chalk.green(`version ${version}`))
        spinner = ora('Downloading...').start();

        const src = path.resolve(__dirname, `./templates/${answers.framework}-${answers.bundler}-${answers.variant}`)
        const dest = path.resolve(process.cwd(), answers.projectName)

        copy(src, dest)

        spinner.succeed();
        console.log(chalk.green('\n Generation completed!'))
        console.log(`\n cd ${answers.projectName}`)
        console.log(`\n pnpm run dev`)
    })
    .catch((error) => {
        spinner.fail();
        if (error.isTtyError) {
            console.log(`${chalk.red(`Error:`)} Prompt couldn't be rendered in the current environment`);
        } else {
            console.log(`${chalk.red(`Generation failed!`)}\n${error}`);
        }
    });

function copy(src, dest) {
    const stat = fs.statSync(src)
    if (stat.isDirectory()) {
        copyDir(src, dest)
    } else {
        fs.copyFileSync(src, dest)
    }
}

function copyDir(srcDir, destDir) {
    fs.mkdirSync(destDir, { recursive: true })
    for (const file of fs.readdirSync(srcDir)) {
        const srcFile = path.resolve(srcDir, file)
        const destFile = path.resolve(destDir, file)
        copy(srcFile, destFile)
    }
}