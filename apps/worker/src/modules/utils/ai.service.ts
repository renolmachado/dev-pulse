import Groq from 'groq-sdk';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  public readonly groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY ?? '',
    });
  }
}
