import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function removeSimpleComments(content: string): string {
  let result = '';
  let i = 0;
  const len = content.length;
  let inString = false;
  let stringChar = '';
  let inTemplateString = false;
  let inRegex = false;

  while (i < len) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (inTemplateString) {
      result += char;
      if (char === '`' && content[i - 1] !== '\\') {
        inTemplateString = false;
      }
      i++;
      continue;
    }

    if (inString) {
      result += char;
      if (char === stringChar && content[i - 1] !== '\\') {
        inString = false;
      }
      i++;
      continue;
    }

    if (inRegex) {
      result += char;
      if (char === '/' && content[i - 1] !== '\\') {
        inRegex = false;
      }
      i++;
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      result += char;
      i++;
      continue;
    }

    if (char === '`') {
      inTemplateString = true;
      result += char;
      i++;
      continue;
    }

    if (char === '{' && nextChar === '/' && content[i + 2] === '*') {
      let commentEnd = i + 3;
      while (commentEnd < len - 1) {
        if (
          content[commentEnd] === '*' &&
          content[commentEnd + 1] === '/' &&
          content[commentEnd + 2] === '}'
        ) {
          commentEnd += 3;
          break;
        }
        commentEnd++;
      }

      const removedComment = content.substring(i, commentEnd);
      const hasNewlines = (removedComment.match(/\n/g) || []).length;
      if (hasNewlines > 0) {
        result += '\n'.repeat(hasNewlines);
      }

      i = commentEnd;
      continue;
    }

    if (char === '/' && nextChar === '/') {
      let commentEnd = i;
      while (commentEnd < len && content[commentEnd] !== '\n') {
        commentEnd++;
      }
      if (content[commentEnd] === '\n') {
        result += '\n';
        i = commentEnd + 1;
      } else {
        i = commentEnd;
      }
      continue;
    }

    if (char === '/' && nextChar === '*') {
      const isJSDoc = content[i + 2] === '*' && content[i + 3] !== '/';

      if (isJSDoc) {
        let commentEnd = i + 2;
        while (commentEnd < len - 1) {
          if (content[commentEnd] === '*' && content[commentEnd + 1] === '/') {
            commentEnd += 2;
            break;
          }
          commentEnd++;
        }
        result += content.substring(i, commentEnd);
        i = commentEnd;
        continue;
      }

      let commentEnd = i + 2;
      while (commentEnd < len - 1) {
        if (content[commentEnd] === '*' && content[commentEnd + 1] === '/') {
          commentEnd += 2;
          break;
        }
        commentEnd++;
      }

      const removedComment = content.substring(i, commentEnd);
      const hasNewlines = (removedComment.match(/\n/g) || []).length;
      if (hasNewlines > 0) {
        result += '\n'.repeat(hasNewlines);
      }

      i = commentEnd;
      continue;
    }

    result += char;
    i++;
  }

  return result;
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      if (!['node_modules', 'dist', 'build', '.next', '.git'].includes(file)) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      }
    } else {
      if (
        /\.(ts|tsx|js|jsx)$/.test(file) &&
        !file.includes('remove-back-comments')
      ) {
        arrayOfFiles.push(filePath);
      }
    }
  });

  return arrayOfFiles;
}

function processFiles(): void {
  try {
    const projectRoot = path.join(__dirname);
    const files = getAllFiles(projectRoot);
    console.log(`Found ${files.length} files to process`);

    let processedCount = 0;
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const newContent = removeSimpleComments(content);

        if (content !== newContent) {
          fs.writeFileSync(file, newContent, 'utf8');
          processedCount++;
          console.log(`✓ ${path.relative(projectRoot, file)}`);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        console.error(`✗ Error processing ${file}:`, errorMessage);
      }
    }

    console.log(`\nProcessed ${processedCount} files with comments removed`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error:', errorMessage);
    process.exit(1);
  }
}

processFiles();
//"remove:comments": "ts-node scripts/remove-back-comments.ts" agregar al package.json y luego ejecutar pnpm remove:comments
