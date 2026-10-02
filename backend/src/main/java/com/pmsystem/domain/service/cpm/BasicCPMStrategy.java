package com.pmsystem.domain.service.cpm;

import com.pmsystem.domain.dto.CPMResultDTO;
import com.pmsystem.domain.dto.TaskNodeDTO;
import com.pmsystem.domain.exception.CircularDependencyException;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

public class BasicCPMStrategy implements CPMStrategy {

    private static class NodeState {
        TaskNodeDTO task;
        double es = 0.0;
        double ef = 0.0;
        double ls = Double.MAX_VALUE;
        double lf = Double.MAX_VALUE;

        NodeState(TaskNodeDTO task) {
            this.task = task;
        }
    }

    @Override
    public List<CPMResultDTO> calculate(List<TaskNodeDTO> tasks) {
        Map<Long, NodeState> nodeMap = tasks.stream()
                .collect(Collectors.toMap(TaskNodeDTO::id, NodeState::new));

        List<Long> topologicallySorted = topologicalSort(tasks);

        for (Long taskId : topologicallySorted) {
            NodeState current = nodeMap.get(taskId);
            double maxPredecessorEF = 0.0;

            for (Long predId : current.task.predecessors()) {
                NodeState predNode = nodeMap.get(predId);
                if (predNode != null) {
                    maxPredecessorEF = Math.max(maxPredecessorEF, predNode.ef);
                }
            }

            current.es = maxPredecessorEF;
            current.ef = current.es + current.task.duration();
        }

        double projectDuration = nodeMap.values().stream()
                .mapToDouble(n -> n.ef)
                .max()
                .orElse(0.0);

        List<Long> reversedSorted = new ArrayList<>(topologicallySorted);
        Collections.reverse(reversedSorted);

        for (Long taskId : reversedSorted) {
            NodeState current = nodeMap.get(taskId);

            if (current.task.successors().isEmpty()) {
                current.lf = projectDuration;
            } else {
                double minSuccessorLS = Double.MAX_VALUE;
                for (Long succId : current.task.successors()) {
                    NodeState succNode = nodeMap.get(succId);
                    if (succNode != null) {
                        minSuccessorLS = Math.min(minSuccessorLS, succNode.ls);
                    }
                }
                current.lf = minSuccessorLS == Double.MAX_VALUE ? projectDuration : minSuccessorLS;
            }
            current.ls = current.lf - current.task.duration();
        }

        return nodeMap.values().stream()
                .map(n -> {
                    double slack = n.lf - n.ef;
                    boolean isCritical = Math.abs(slack) < 0.001;
                    return new CPMResultDTO(
                            n.task.id(), n.es, n.ef, n.ls, n.lf, slack, isCritical);
                })
                .collect(Collectors.toList());
    }

    private List<Long> topologicalSort(List<TaskNodeDTO> tasks) {
        Map<Long, Integer> inDegree = new HashMap<>();
        Map<Long, List<Long>> graph = new HashMap<>();

        for (TaskNodeDTO task : tasks) {
            inDegree.put(task.id(), 0);
            graph.put(task.id(), new ArrayList<>());
        }

        for (TaskNodeDTO task : tasks) {
            for (Long succId : task.successors()) {
                graph.computeIfAbsent(task.id(), k -> new ArrayList<>()).add(succId);
                inDegree.put(succId, inDegree.getOrDefault(succId, 0) + 1);
            }
        }

        Queue<Long> queue = new LinkedList<>();
        for (Map.Entry<Long, Integer> entry : inDegree.entrySet()) {
            if (entry.getValue() == 0) {
                queue.add(entry.getKey());
            }
        }

        List<Long> result = new ArrayList<>();
        while (!queue.isEmpty()) {
            Long current = queue.poll();
            result.add(current);

            for (Long neighbor : graph.getOrDefault(current, Collections.emptyList())) {
                inDegree.put(neighbor, inDegree.get(neighbor) - 1);
                if (inDegree.get(neighbor) == 0) {
                    queue.add(neighbor);
                }
            }
        }

        if (result.size() != tasks.size()) {
            throw new CircularDependencyException("Cycle detected in task dependencies graph. Cannot calculate CPM.");
        }

        return result;
    }
}
