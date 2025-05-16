import { Accordion, AccordionContent, AccordionTrigger, AccordionItem } from '@/components/ui'
import React from 'react'

const HomePage = () => {
  return (
    <div>
      <h1 className='text-center text-5xl font-extrabold'>Standard Practices</h1>
      <div className='flex justify-center items-center flex-col'>
        <Accordion className='w-5xl' type="multiple">
          <AccordionItem value="item-1">
            <AccordionTrigger>Custom Component</AccordionTrigger>
            <AccordionContent>
              Start making components in the <span className='font-mono bg-gray-400 px-2 py-1 rounded-md'>/components/</span> folder and import and export it in <span className='font-mono bg-gray-400 px-2 py-1 rounded-md'>/components/index.ts</span> file
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>From ShadCN</AccordionTrigger>
            <AccordionContent>
              It&apos;ll automatically add components in the <span className='font-mono bg-gray-400 px-2 py-1 rounded-md'>/components/ui</span> folder and import and export it in <span className='font-mono bg-gray-400 px-2 py-1 rounded-md'>/components/ui/index.ts</span> should be done manually file
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Commit Messages</AccordionTrigger>
            <AccordionContent>
              <div className='m-2'>
                <span className='font-mono bg-gray-400 px-2 py-1 rounded-md'>feat</span> a new feature is introduced with the changes
              </div>
              <div className='m-2'>
                <span className='font-mono bg-gray-400 px-2 py-1 rounded-md'>fix</span> a bug fix has occurred
              </div>
              <div className='m-2'>
                <span className='font-mono bg-gray-400 px-2 py-1 rounded-md'>chore</span> changes that do not relate to a fix or feature and don&apos;t modify <span className='font-mono bg-gray-400 px-2 py-1 rounded-md'>src</span> or <span className='font-mono bg-gray-400 px-2 py-1 rounded-md'>test</span> files (for example updating dependencies)
              </div>
              <div className='m-2'>
                <span className='font-mono bg-gray-400 px-2 py-1 rounded-md'>refactor</span> refactored code that neither fixes a bug nor adds a feature
              </div>
              <div className='m-2'>
                <span className='font-mono bg-gray-400 px-2 py-1 rounded-md'>docs</span> updates to documentation such as the <span className='font-mono bg-gray-400 px-2 py-1 rounded-md'>README</span> or other markdown files
              </div>
              <div className='m-2'>
                <span className='font-mono bg-gray-400 px-2 py-1 rounded-md'>style</span> changes that do not affect the meaning of the code, likely related to code formatting such as white-space, missing semi-colons, and so on
              </div>
              <div className='m-2'>
                <span className='font-mono bg-gray-400 px-2 py-1 rounded-md'>test</span> including new or correcting previous tests
              </div>
              <div className='m-2'>
                <span className='font-mono bg-gray-400 px-2 py-1 rounded-md'>perf</span> performance improvements
              </div>
              <div className='m-2'>
                <span className='font-mono bg-gray-400 px-2 py-1 rounded-md'>ci</span> continuous integration related
              </div>
              <div className='m-2'>
                <span className='font-mono bg-gray-400 px-2 py-1 rounded-md'>build</span> changes that affect the build system or external dependencies
              </div>
              <div className='m-2'>
                <span className='font-mono bg-gray-400 px-2 py-1 rounded-md'>revert</span> reverts a previous commit
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}

export default HomePage