export interface CodingQuizRequest {
  language?: string;
  difficulty?: string;
  amount?: number;
}

export interface CodingQuizResponse {
  success: boolean;
  questions: QuizQuestion[];
  total_questions: number;
  language: string;
  difficulty: string;
  creator: string;
  error?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
  language: string;
}

export class CodingQuizService {
  private readonly creator = 'Broken VZN';

  private readonly pythonQuestions = {
    beginner: [
      {
        question: "What is the output of print(type([]))?",
        options: ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "Error"],
        correct_answer: "<class 'list'>",
        explanation: "The type() function returns the class type of the object"
      },
      {
        question: "Which keyword is used to define a function in Python?",
        options: ["def", "function", "define", "func"],
        correct_answer: "def",
        explanation: "The 'def' keyword is used to define functions in Python"
      },
      {
        question: "What does len([1, 2, 3, 4]) return?",
        options: ["3", "4", "5", "Error"],
        correct_answer: "4",
        explanation: "len() returns the number of items in a sequence"
      },
      {
        question: "What is the correct way to create a comment in Python?",
        options: ["// This is a comment", "# This is a comment", "/* This is a comment */", "-- This is a comment"],
        correct_answer: "# This is a comment",
        explanation: "In Python, comments start with the # symbol"
      },
      {
        question: "What is the output of print(3 ** 2)?",
        options: ["6", "9", "32", "Error"],
        correct_answer: "9",
        explanation: "The ** operator is used for exponentiation in Python"
      }
    ],
    intermediate: [
      {
        question: "What is the output of [x**2 for x in range(3)]?",
        options: ["[0, 1, 4]", "[1, 4, 9]", "[0, 1, 2]", "Error"],
        correct_answer: "[0, 1, 4]",
        explanation: "List comprehension squares numbers 0, 1, 2"
      },
      {
        question: "Which method removes and returns the last item from a list?",
        options: ["remove()", "pop()", "delete()", "clear()"],
        correct_answer: "pop()",
        explanation: "pop() removes and returns the last element"
      },
      {
        question: "What does the zip() function do?",
        options: ["Compresses files", "Combines multiple iterables", "Creates tuples", "Sorts lists"],
        correct_answer: "Combines multiple iterables",
        explanation: "zip() combines multiple iterables element by element"
      },
      {
        question: "What is the output of list(range(2, 8, 2))?",
        options: ["[2, 4, 6]", "[2, 4, 6, 8]", "[2, 3, 4, 5, 6, 7]", "[2, 8, 2]"],
        correct_answer: "[2, 4, 6]",
        explanation: "range(start, stop, step) generates numbers from start to stop-1 with given step"
      }
    ],
    advanced: [
      {
        question: "What is a decorator in Python?",
        options: ["A design pattern", "A function that modifies another function", "A class method", "A data type"],
        correct_answer: "A function that modifies another function",
        explanation: "Decorators are functions that modify or extend the behavior of other functions"
      },
      {
        question: "What does the yield keyword do?",
        options: ["Returns a value", "Creates a generator", "Stops execution", "Imports modules"],
        correct_answer: "Creates a generator",
        explanation: "yield is used to create generator functions that can pause and resume execution"
      }
    ]
  };

  private readonly javascriptQuestions = {
    beginner: [
      {
        question: "What is the correct way to declare a variable in JavaScript?",
        options: ["var name;", "variable name;", "v name;", "declare name;"],
        correct_answer: "var name;",
        explanation: "Variables are declared using var, let, or const keywords"
      },
      {
        question: "What does console.log(typeof 42) output?",
        options: ["number", "integer", "float", "string"],
        correct_answer: "number",
        explanation: "JavaScript has a single number type for integers and floats"
      },
      {
        question: "How do you create a function in JavaScript?",
        options: ["function myFunc() {}", "def myFunc() {}", "create myFunc() {}", "func myFunc() {}"],
        correct_answer: "function myFunc() {}",
        explanation: "Functions in JavaScript are declared using the 'function' keyword"
      },
      {
        question: "What is the output of console.log(2 + '2')?",
        options: ["4", "22", "Error", "NaN"],
        correct_answer: "22",
        explanation: "JavaScript performs string concatenation when one operand is a string"
      }
    ],
    intermediate: [
      {
        question: "What is the output of [1, 2, 3].map(x => x * 2)?",
        options: ["[2, 4, 6]", "[1, 2, 3]", "[1, 4, 9]", "Error"],
        correct_answer: "[2, 4, 6]",
        explanation: "map() creates a new array with transformed elements"
      },
      {
        question: "What does the 'this' keyword refer to in JavaScript?",
        options: ["The current function", "The global object", "The calling context", "The parent object"],
        correct_answer: "The calling context",
        explanation: "'this' refers to the object that called the function"
      },
      {
        question: "What is the difference between '==' and '===' in JavaScript?",
        options: ["No difference", "=== checks type and value", "== is faster", "=== is deprecated"],
        correct_answer: "=== checks type and value",
        explanation: "=== performs strict equality checking both type and value"
      }
    ],
    advanced: [
      {
        question: "What is a closure in JavaScript?",
        options: ["A loop that closes", "A function with access to outer scope", "A closed object", "A method to end execution"],
        correct_answer: "A function with access to outer scope",
        explanation: "Closures allow functions to access variables from their outer scope even after the outer function returns"
      },
      {
        question: "What does async/await do in JavaScript?",
        options: ["Creates parallel execution", "Handles asynchronous operations", "Speeds up code", "Creates delays"],
        correct_answer: "Handles asynchronous operations",
        explanation: "async/await provides a cleaner way to work with Promises and asynchronous code"
      }
    ]
  };

  async generateQuiz(request: CodingQuizRequest): Promise<CodingQuizResponse> {
    try {
      const { 
        language = 'python', 
        difficulty = 'intermediate', 
        amount = 5 
      } = request;

      if (amount > 20) {
        return {
          success: false,
          questions: [],
          total_questions: 0,
          language,
          difficulty,
          creator: this.creator,
          error: 'Maximum 20 questions allowed'
        };
      }

      const questionSets: any = {
        python: this.pythonQuestions,
        javascript: this.javascriptQuestions
      };

      const selectedLanguage = questionSets[language] ? language : 'python';
      const availableQuestions = questionSets[selectedLanguage][difficulty] || 
                                questionSets[selectedLanguage]['beginner'];

      // Randomly select questions
      const selectedQuestions = this.getRandomQuestions(availableQuestions, amount);
      
      const questions: QuizQuestion[] = selectedQuestions.map(q => ({
        ...q,
        difficulty,
        language: selectedLanguage
      }));

      return {
        success: true,
        questions,
        total_questions: questions.length,
        language: selectedLanguage,
        difficulty,
        creator: this.creator
      };

    } catch (error) {
      console.error('Coding quiz generation error:', error);
      return {
        success: false,
        questions: [],
        total_questions: 0,
        language: request.language || 'python',
        difficulty: request.difficulty || 'intermediate',
        creator: this.creator,
        error: 'Failed to generate quiz'
      };
    }
  }

  private getRandomQuestions(questions: any[], amount: number): any[] {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(amount, shuffled.length));
  }

  getAvailableLanguages(): string[] {
    return ['python', 'javascript'];
  }

  getAvailableDifficulties(): string[] {
    return ['beginner', 'intermediate', 'advanced'];
  }
}

export const codingQuizService = new CodingQuizService();