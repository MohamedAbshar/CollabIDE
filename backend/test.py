import queue
from jupyter_client.manager import start_new_kernel

code_to_run = """
name = input("What is your name? ")
print(f"Hello, {name}!")
x = 10 + 20
print(f"Calculation result: {x}")
"""


def run_interactive_code(code_string):
    # 1. Start the kernel normally (NOT in a 'with' block)
    manager, client = start_new_kernel()

    try:
        # 2. Execute the code
        msg_id = client.execute(code_string, allow_stdin=True)

        while True:
            try:
                # Check for input requests first
                try:
                    stdin_msg = client.get_stdin_msg(timeout=0.1)
                    if stdin_msg['msg_type'] == 'input_request':
                        prompt = stdin_msg['content']['prompt']
                        print(f"Kernel is asking: '{prompt}'")

                        # Hardcoded input for testing
                        user_input = "Gemini User"

                        client.input(user_input)
                except queue.Empty:
                    pass

                # Check for output
                msg = client.get_iopub_msg(timeout=0.1)

                if msg['parent_header'].get('msg_id') != msg_id:
                    continue

                msg_type = msg['msg_type']
                content = msg['content']

                if msg_type == 'stream':
                    print(f"[{content['name'].upper()}] {content['text']}", end='')

                elif msg_type == 'error':
                    print(f"\n❌ Error: {content['ename']}: {content['evalue']}")

                elif msg_type == 'status' and content['execution_state'] == 'idle':
                    print("\n--- Execution Finished ---")
                    break

            except queue.Empty:
                continue
            except KeyboardInterrupt:
                print("Interrupted.")
                break

    finally:
        # 3. CRITICAL: Ensure we shut down the kernel explicitly
        print("\nShutting down kernel...")
        manager.shutdown_kernel()


# Run the function
if __name__ == "__main__":
    run_interactive_code(code_to_run)