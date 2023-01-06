#!/usr/bin/env node

import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import inquirer from "inquirer";
import chalk from "chalk";
import ora, { Ora } from "ora";

interface Answers {
    framework: string
    bundler: string
    variant: string
    projectName: string
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const { version } = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json'), 'utf8'))

const FRAMEWORK = {
    type: "list",
    name: "framework",
    message: "Select a framework:",
    choices: ['Vue3', 'React'],
}

const BUNDLER = {
    type: "list",
    name: "bundler",
    message: "Select a bundler:",
    choices: ['Vite', 'Rollup'],
}

const VARIANT = {
    type: "list",
    name: "variant",
    message: "Select a variant:",
    choices: ['Javascript', 'Typescript'],
}

const PROJECTNAME = {
    type: "input",
    name: "projectName",
    message: "Project name:",
    default: "my-project",
}

let spinner: Ora

inquirer
    .prompt([
        FRAMEWORK,
        BUNDLER,
        VARIANT,
        PROJECTNAME
    ])
    .then((answers: Answers) => {
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

function copy(src: string, dest: string) {
    const stat = fs.statSync(src)
    if (stat.isDirectory()) {
        copyDir(src, dest)
    } else {
        fs.copyFileSync(src, dest)
    }
}

function copyDir(srcDir: string, destDir: string) {
    fs.mkdirSync(destDir, { recursive: true })
    for (const file of fs.readdirSync(srcDir)) {
        const srcFile = path.resolve(srcDir, file)
        const destFile = path.resolve(destDir, file)
        copy(srcFile, destFile)
    }
}