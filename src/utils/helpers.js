import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';

// Utility functions for the research assistant

export class Logger {
  static info(message) {
    console.log(chalk.blue('ℹ'), message);
  }

  static success(message) {
    console.log(chalk.green('✓'), message);
  }

  static warning(message) {
    console.log(chalk.yellow('⚠'), message);
  }

  static error(message) {
    console.log(chalk.red('✗'), message);
  }

  static title(message) {
    console.log('\n' + chalk.bold.cyan(message) + '\n');
  }

  static subtitle(message) {
    console.log(chalk.bold.white(message));
  }

  static highlight(message) {
    return chalk.yellow.bold(message);
  }
}

export class Spinner {
  constructor(text) {
    this.spinner = ora({
      text,
      color: 'cyan',
      spinner: 'dots'
    });
  }

  start(text) {
    if (text) this.spinner.text = text;
    this.spinner.start();
    return this;
  }

  succeed(text) {
    this.spinner.succeed(text);
    return this;
  }

  fail(text) {
    this.spinner.fail(text);
    return this;
  }

  stop() {
    this.spinner.stop();
    return this;
  }

  update(text) {
    this.spinner.text = text;
    return this;
  }
}

export class Formatter {
  static box(content, title) {
    return boxen(content, {
      title,
      titleAlignment: 'center',
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    });
  }

  static section(title, content) {
    const header = chalk.bold.blue(`\n━━━ ${title} ━━━`);
    return `${header}\n${content}\n`;
  }

  static list(items, numbered = false) {
    return items.map((item, index) => {
      const bullet = numbered ? chalk.cyan(`${index + 1}.`) : chalk.cyan('•');
      return `${bullet} ${item}`;
    }).join('\n');
  }

  static highlight(text, color = 'yellow') {
    return chalk[color].bold(text);
  }

  static dim(text) {
    return chalk.dim(text);
  }
}

export class TextProcessor {
  static cleanText(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/\*(.*?)\*/g, '$1')     // Remove markdown italic
      .replace(/#{1,6}\s/g, '')        // Remove markdown headers
      .trim();
  }

  static extractKeyPoints(text, maxPoints = 5) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, maxPoints).map(s => s.trim());
  }

  static summarize(text, maxLength = 200) {
    if (text.length <= maxLength) return text;
    
    const sentences = text.split(/[.!?]+/);
    let summary = '';
    
    for (const sentence of sentences) {
      if ((summary + sentence).length > maxLength) break;
      summary += sentence + '. ';
    }
    
    return summary.trim();
  }

  static formatAsMarkdown(sections) {
    let markdown = '';
    
    for (const [title, content] of Object.entries(sections)) {
      markdown += `## ${title}\n\n${content}\n\n`;
    }
    
    return markdown;
  }
}

export class Timer {
  constructor() {
    this.start = Date.now();
  }

  elapsed() {
    return Date.now() - this.start;
  }

  elapsedFormatted() {
    const ms = this.elapsed();
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }
}
