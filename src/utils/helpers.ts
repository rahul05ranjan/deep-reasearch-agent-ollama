import chalk from 'chalk';
import boxen from 'boxen';
import ora, { type Ora } from 'ora';

// Utility functions for the research assistant

export class Logger {
  static info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  static success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  static warning(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  static error(message: string): void {
    console.log(chalk.red('✗'), message);
  }

  static title(message: string): void {
    console.log('\n' + chalk.bold.cyan(message) + '\n');
  }

  static subtitle(message: string): void {
    console.log(chalk.bold.white(message));
  }

  static highlight(message: string): string {
    return chalk.yellow.bold(message);
  }
}

export class Spinner {
  private spinner: Ora;

  constructor(text: string) {
    this.spinner = ora({
      text,
      color: 'cyan',
      spinner: 'dots'
    });
  }

  start(text?: string): this {
    if (text) this.spinner.text = text;
    this.spinner.start();
    return this;
  }

  succeed(text?: string): this {
    this.spinner.succeed(text);
    return this;
  }

  fail(text?: string): this {
    this.spinner.fail(text);
    return this;
  }

  stop(): this {
    this.spinner.stop();
    return this;
  }

  update(text: string): this {
    this.spinner.text = text;
    return this;
  }
}

export class Formatter {
  static box(content: string, title?: string): string {
    return boxen(content, {
      title,
      titleAlignment: 'center',
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    });
  }

  static section(title: string, content: string): string {
    const header = chalk.bold.blue(`\n━━━ ${title} ━━━`);
    return `${header}\n${content}\n`;
  }

  static list(items: string[], numbered = false): string {
    return items.map((item, index) => {
      const bullet = numbered ? chalk.cyan(`${index + 1}.`) : chalk.cyan('•');
      return `${bullet} ${item}`;
    }).join('\n');
  }

  static highlight(text: string, color: 'yellow' | 'cyan' | 'green' | 'red' | 'blue' = 'yellow'): string {
    const colorFn = (chalk as unknown as Record<string, (val: string) => { bold: (v: string) => string }>)[color];
    if (colorFn) {
      return colorFn(text).bold(text);
    }
    return chalk.yellow.bold(text);
  }

  static dim(text: string): string {
    return chalk.dim(text);
  }
}

export class TextProcessor {
  static cleanText(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/\*(.*?)\*/g, '$1')     // Remove markdown italic
      .replace(/#{1,6}\s/g, '')        // Remove markdown headers
      .trim();
  }

  static extractKeyPoints(text: string, maxPoints = 5): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, maxPoints).map(s => s.trim());
  }

  static summarize(text: string, maxLength = 200): string {
    if (text.length <= maxLength) return text;
    
    const sentences = text.split(/[.!?]+/);
    let summary = '';
    
    for (const sentence of sentences) {
      if ((summary + sentence).length > maxLength) break;
      summary += sentence + '. ';
    }
    
    return summary.trim();
  }

  static formatAsMarkdown(sections: Record<string, { content: string } | string>): string {
    let markdown = '';
    
    for (const [title, val] of Object.entries(sections)) {
      const content = typeof val === 'string' ? val : val.content;
      markdown += `## ${title}\n\n${content}\n\n`;
    }
    
    return markdown;
  }
}

export class Timer {
  private start: number;

  constructor() {
    this.start = Date.now();
  }

  elapsed(): number {
    return Date.now() - this.start;
  }

  elapsedFormatted(): string {
    const ms = this.elapsed();
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }
}
