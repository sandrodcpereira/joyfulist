
import React, { useEffect, useState } from 'react';
import ConfettiBoom from 'react-confetti-boom';
import { Sheet } from 'react-modal-sheet';
import './styles/main.scss';

function App() {

  // tasks loader

  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);

  // Load tasks from tasks.json
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/tasks.json`);
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };

    loadTasks();
  }, []);

  // Select 3 random tasks that the user hasn't completed yet
  const selectRandomTasks = () => {
    const completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];
    const availableTasks = tasks.filter(task => !completedTasks.includes(task));
    
    const randomTasks = [];
    while (randomTasks.length < 3 && availableTasks.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableTasks.length);
      randomTasks.push(availableTasks[randomIndex]);
      availableTasks.splice(randomIndex, 1); // Remove selected task from available
    }

    const labelEls = [
      document.querySelector('.taskLabel1'),
      document.querySelector('.taskLabel2'),
      document.querySelector('.taskLabel3')
    ];

    labelEls.forEach((el, idx) => {
      if (el) el.textContent = selectedTasks[idx] || '';
    });

    setSelectedTasks(randomTasks);
  };


  // sheet

  const [isOpen, setOpen] = useState(false);

  // confet
  const [showConfetti, setShowConfetti] = useState(false);

  const throwConfet = () => {
    setShowConfetti(true);
  };

  return (
    <div>     
      {showConfetti && 
        <ConfettiBoom 
          mode={'boom'}
          x={0.75}
          y={0.02}
          deg={120}
          shapeSize={25}
          spreadDeg={100}
          particleCount={100} 
          launchSpeed={.8}
          colors={[
            '#6900E0', 
            '#FFC500', 
            '#ffffff', 
            '#00A88A'
            ]}
      />}

      <header>
          <button id="about" onClick={() => setOpen(true)}>About</button>

          <button id="streak" onClick={throwConfet}>🔥 3 day streak!</button>
      </header>

      <div className="logo-container">
          <h1>Joyfulist</h1>
          <h2>Your daily dose of joy</h2>
      </div>

      <div className="panel">
          <div className="header">
              <p className="caption">Tick at least one to keep your streak going!</p>
          </div>

          <div>
           
            Experimental code
        
          </div>

          <div id="tasks">

            <div>
              <input type="checkbox" id="task1" />
              <label className="taskLabel1" for="task1">Befriend a monkey</label>
            </div>

            <div>
              <input type="checkbox" id="task2" />
              <label className="taskLabel2" for="task2">Knit a big ass sweater</label>
            </div>

            <div>
              <input type="checkbox" id="task3" />
              <label className="taskLabel3" for="task3">Eat a very big lasagna, so big you don't even think you could possible eat it all but little by little you manage to do it</label>
            </div>

          </div>

          <div className="cta">
              <button id="showTasks" onClick={selectRandomTasks}>Show me today's tasks!</button>
              <button id="share">Share the joy!</button>
          </div>
      </div>

      <Sheet 
        isOpen={isOpen} 
        detent={"content-height"}
        tweenConfig={{ ease: 'easeOut', duration: 0.4 }}
        onClose={() => setOpen(false)
      }>
        <Sheet.Container>
          <Sheet.Header />
          <Sheet.Content>
            <div>

              <div className="header">
                  <p  className="caption">About Joyfulist</p>
                  <div><button id="close-btn" onClick={() => setOpen(false)}>Close</button></div>
              </div>

              <div className="content">
                  <img src={`${process.env.PUBLIC_URL}/assets/sparkle.png`} alt="Sparkle" />
                  <p><span>Joyfulist</span> was created by <a href="https://www.theonboardinglab.com/" target="_blank" rel="noreferrer noopener">Clare</a> and <a href="https://sandro.design" target="_blank" rel="noreferrer noopener">Sandro</a> in hopes to bring a little more joy into your life.</p>
              </div>

              <div className="content">
                  <img src={`${process.env.PUBLIC_URL}/assets/icon.png`} alt="App icon" />

                  <p>Add to your home screen by tapping <span>Share > Add to Home Screen</span> on your phone.</p>
              </div>

            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop />
      </Sheet>
    </div>

  );
}

export default App;
