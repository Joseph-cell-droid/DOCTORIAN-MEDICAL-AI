# Medical Neural Training Protocol (Unsloth - Phi-3 Optimized)
# This script is designed for local GPU clusters (A100/L40/RTX4090/RTX3090)

from unsloth import FastLanguageModel
import torch
from trl import SFTTrainer
from transformers import TrainingArguments
from datasets import load_dataset
import os

# 1. Configuration
# Defaulting to high-performance, lightweight llama3.1 (8B parameters) for extreme speed.
model_name = "meta-llama/llama-3.1-8b-instruct" 
max_seq_length = 2048
dtype = None # None for auto detection. Float16 for Tesla T4, V100, Bfloat16 for Ampere+
load_in_4bit = True # Use 4bit quantization to drastically reduce memory usage and boost generation speeds

# 2. Load Model & Tokenizer
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = model_name,
    max_seq_length = max_seq_length,
    dtype = dtype,
    load_in_4bit = load_in_4bit,
)

# 3. Add LoRA Adapters
# We optimize the adapter rank and target modules to strike a perfect synergy between accuracy and 
# blazing fast response generation speed.
model = FastLanguageModel.get_peft_model(
    model,
    r = 8,            # Lowering LoRA rank slightly (8 instead of 16) results in faster inference pathways while maintaining protocol convergence
    target_modules = ["qkv_proj", "o_proj", "gate_up_proj", "down_proj"], # Phi-3 target projections
    lora_alpha = 16,
    lora_dropout = 0, # Optimized to 0 for maximum inference speeds
    bias = "none",    # Optimized to "none" 
    use_gradient_checkpointing = "unsloth", # Use 4x less memory
    random_state = 3407,
    use_rslora = False,
    loftq_config = None,
)

# 4. Medical Logic Instruction Format (Adapted to Phi-3 chat structure)
medical_prompt = """<|system|>
You are Doctorian AI, a high-performance clinical intelligence model. Analyze the inquiry and provide a professional, evidence-based response following the Doctorian Protocol. Use crisp, high-speed clinical synthesis. Direct and professional.<|end|>
<|user|>
Inquiry:
{}<|end|>
<|assistant|>
{}<|end|>"""

def formatting_prompts_func(examples):
    instructions = examples["instruction"]
    inputs       = examples["input"]
    outputs      = examples["output"]
    texts = []
    for instruction, input, output in zip(instructions, inputs, outputs):
        prompt_input = instruction
        if input and input.strip():
            prompt_input += "\n" + input
        text = medical_prompt.format(prompt_input, output)
        texts.append(text)
    return { "text" : texts, }

# 5. Load Healthcare Dataset
# Expects a JSONL with clinical cases or WHO protocols
# Generate this file using 'export_medical_dataset.py' to pipe in-app medical.db table records
dataset = load_dataset("json", data_files="medical_data.jsonl", split="train")
dataset = dataset.map(formatting_prompts_func, batched = True,)

# 6. Training Execution (Optimized for speed and minimal step-wise cost)
trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = dataset,
    dataset_text_field = "text",
    max_seq_length = max_seq_length,
    dataset_num_proc = 2,
    packing = False, # Set to False for instruction-focused training
    args = TrainingArguments(
        per_device_train_batch_size = 4, # Slightly larger batch for batch efficiency
        gradient_accumulation_steps = 2,
        warmup_steps = 5,
        max_steps = 60, # Fast training cycles
        learning_rate = 2e-4,
        fp16 = not torch.cuda.is_bf16_supported(),
        bf16 = torch.cuda.is_bf16_supported(),
        logging_steps = 1,
        optim = "adamw_8bit",
        weight_decay = 0.01,
        lr_scheduler_type = "linear",
        seed = 3407,
        output_dir = "medical_model_outputs",
    ),
)

# 7. Start Fine-tuning
print("Initializing Clinical Synthesis...")
trainer_stats = trainer.train()

# 8. Save fine-tuned adapters
model.save_pretrained("doctorian_llama3.1_adapters")
tokenizer.save_pretrained("doctorian_llama3.1_adapters")

print("Fine-tuning completed. llama3.1 Neural weights saved locally.")
