import React, { useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { Employee } from '../types';

// Define the recursive node structure for the chart
interface OrgNode extends Employee {
    children: OrgNode[];
}

// Recursive component to render each employee node and their subordinates
const OrgChartNode: React.FC<{ node: OrgNode }> = ({ node }) => (
  <div className="flex flex-col items-center">
    {/* The card representing the employee */}
    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg w-48 text-center border-2 border-slate-200 dark:border-slate-700 hover:shadow-indigo-500/20 hover:border-indigo-400 transition-all cursor-pointer">
      <img
        src={node.photoUrl}
        alt={`${node.firstName} ${node.surname}`}
        className="w-16 h-16 rounded-full object-cover mx-auto border-4 border-slate-100 dark:border-slate-700"
      />
      <p className="mt-2 font-bold text-slate-800 dark:text-slate-100 truncate">{node.firstName} {node.surname}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{node.role}</p>
    </div>

    {/* Render children and connectors if they exist */}
    {node.children.length > 0 && (
      <>
        {/* Vertical connector line pointing down from the parent card */}
        <div className="w-px h-8 bg-slate-300 dark:bg-slate-600" />
        
        {/* Container for children nodes */}
        <ul className="flex justify-center gap-x-8 relative">
          {/* Horizontal connector line that spans across all children */}
          <div className="absolute top-0 h-px bg-slate-300 dark:bg-slate-600 w-full" />
          
          {node.children.map(child => (
            <li key={child.id} className="relative">
              {/* Vertical connector line pointing up from each child to the horizontal line */}
              <div className="absolute bottom-full w-px h-8 bg-slate-300 dark:bg-slate-600 left-1/2 -translate-x-1/2" />
              <OrgChartNode node={child} />
            </li>
          ))}
        </ul>
      </>
    )}
  </div>
);


const OrgChart: React.FC = () => {
    const { employees } = useAppContext();
    const { t } = useI18n();

    const orgTree = useMemo(() => {
        const nodes: Record<string, OrgNode> = {};
        const roots: OrgNode[] = [];

        if (!employees || employees.length === 0) return [];

        employees.forEach(emp => {
            nodes[emp.id] = { ...emp, children: [] };
        });

        employees.forEach(emp => {
            if (emp.reportsTo && nodes[emp.reportsTo]) {
                nodes[emp.reportsTo].children.push(nodes[emp.id]);
            } else {
                roots.push(nodes[emp.id]);
            }
        });
        
        return roots;

    }, [employees]);


    return (
        <div className="container mx-auto animate-fadeIn">
            <h1 className="text-3xl font-bold mb-6">{t('sidebar.org_chart')}</h1>
            <div className="bg-slate-50/70 dark:bg-slate-900/50 p-4 sm:p-6 rounded-lg shadow-lg">
                <div className="overflow-x-auto pb-8">
                    <div className="inline-block min-w-full">
                        {orgTree.length > 0 ? (
                            <div className="flex justify-center">
                            {orgTree.map(rootNode => (
                                <div key={rootNode.id} className="px-8">
                                <OrgChartNode node={rootNode} />
                                </div>
                            ))}
                            </div>
                        ) : (
                            <p className="text-center text-slate-500">{t('org_chart.placeholder')}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrgChart;